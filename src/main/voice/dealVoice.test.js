/**
 * @author Created by felix on 17-8-30.
 * @email   307253927@qq.com
 */
'use strict';
const fs        = require('fs')
const SaveVoice = require('./dealVoice')

function write() {
  let sv = fs.createWriteStream('/tmp/temp.buf')
  sv.write(Buffer.from(new Int16Array([1, 2, 3, 4, 5, 6]).buffer))
  sv.end()
}

function read() {
  let rs = fs.createReadStream('/tmp/temp.buf')
  rs.on('data', (cnt) => {
    console.log(cnt)
    console.log(new Uint8Array(cnt))
  })
  rs.on('end', () => {
    console.log("读取完毕");
  })
}

// write()
// read()

var a = new Int16Array([-234, 56, 8, -1])
var b = new Uint8Array(a.buffer)
var c = new Int16Array(b.buffer)
console.log(a, b, c)




