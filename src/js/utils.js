/**
 * @author Created by felix on 17-9-19.
 * @email   307253927@qq.com
 */
'use strict';

export function sortResult(list) {
  return list.sort((a, b) => {
    if (a.number === b.number) {
      return a.channel - b.channel
    } else {
      return a.number - b.number
    }
  })
}