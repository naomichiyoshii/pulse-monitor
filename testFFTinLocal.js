var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var data = [557,702,704,688,781,628,737,651,664,733,580,752,706,777,777,790,650,652,846,751,796,707,707,766,803,803,1078,1140,1140,708,744,616,721,689,637,797,739,741,846,720,808,822,742,918,780,886,826,809,823,753,665,840,776,652,652,947,802,682,698,744,672,713,735,613,749,556,556,725,688,655,660,763,867,763,874,909,832,886,709,791,781,803,801,852,835,831,888,810,802,781,709,846,732,803,698,665,794,685,677,665,737,706,772,734,626,761,709,709,720,812,766,732,718,703,702,751,752,752,710,693,780,760,745,772,853,755,877,813];
console.log("asdfa"+data);
var phasors = fft(data);
var frequencies = fftUtil.fftFreq(phasors, 1); // Sample rate and coef is just used for length, and frequency step
var magnitudes = fftUtil.fftMag(phasors);
frequencies.splice(0, 1);
magnitudes.splice(0, 1);
console.log('パワー配列： ' + frequencies);
console.log('周波数配列： ' + magnitudes);
