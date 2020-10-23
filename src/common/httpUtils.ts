"use strict";
import * as http from "http";
import { Logger } from '../common/logger';
const logger = Logger.instance;
/**
 * nodejs发送http请求
 * 
 */
export class HttpUtil {
    public static get(url: string) {
        logger.info('http time:  ' + new Date());
                http.get(url, function (res) {
            logger.info("Got response: " + res.statusCode);
            var json = '';
            res.on('data', function (d) {
                json += d;
                logger.info("data: " + json);
            });
            res.on('end', function () {
                //get datas
                json = JSON.parse(json);
                logger.info("end: " + json);
            });

        }).on('error', function (e) {
            logger.info("Got error: " + e.message);
        });
    }


}




// datas = [];//参数为数据类型
// function postData(datas) {
//     logger.debug('into  postDatafuntion  datas.length:（' + datas.length + '）');
//     var contents = JSON.stringify(datas);
//     contents = Buffer.from(contents, 'utf8');
//     // var u = URL.parse("http://127.0.0.1:3000/Config");//local host
//     logger.debug('hostname: ' + u.hostname + '   port:  ' + u.port + '   path:  ' + u.path);
//     logger.info('hostname: ' + u.hostname + '   port:  ' + u.port + '   path:  ' + u.path);
//     var options = {
//         hostname: u.hostname,
//         port: u.port,
//         path: u.path,
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',/*'application/x-www-form-urlendcoded',*/
//             'Content-Length': contents.length
//         }
//     }
//     var req = https.request(options, function (res) {
//         res.setEncoding('utf8');
//         var html = '';
//         res.on('data', function (data) {
//             html += data;  //server back data

//         });
//         res.on('end', function () {
//             logger.debug('server callback : ' + html);
//             logger.debug('数据发送成功');

//         });
//         res.on('error', function (e) {
//             logger.debug(moment().format('YYYY-MM-DD HH:mm:ss') + e);
//         });
//         req.write(contents);
//         req.end;

//     }