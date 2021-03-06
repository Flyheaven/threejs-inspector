/* eslint-disable no-console */
import { Observable } from "rxjs";
import { publishReplay } from "rxjs/operators";
import connection$ from "./connection$";
import debug from "./debug";

const connections$ = Observable.create(observer => {
  const connections = {};
  const disconnectSubscriptions = [];
  const connectSubscription = connection$.subscribe(connection => {
    connections[connection.id] = connection;
    debug &&
      console.log(
        "connection [" + connection.name + " " + connection.id + "] added"
      );
    //发出连接后的列表
    observer.next(connections);
    disconnectSubscriptions.push(
      connection.disconnect$.subscribe(() => {
        debug &&
          console.log(
            "connection [" + connection.name + " " + connection.id + "] removed"
          );
        delete connections[connection.id];
        //发出断开连接后的连接列表
        observer.next(connections);
      })
    );
  });
  return () => {
    connectSubscription.unsubscribe();
    disconnectSubscriptions.forEach(subscription => subscription.unsubscribe());
  };
}).pipe(publishReplay(1));

//启动connection执行
export const subscription = connections$.connect();

export default connections$;
