Module.instance = Module();
var libopus     = Module.instance;

var pcm_len  = 4 /*Float32*/ * 2 /*channels*/ * 120 /*ms*/ * 48 /*samples/ms*/;
var data_len = 120 /*ms*/ * 512 /*bits per ms*/;

var utils       = {
  p_pcm         : libopus._malloc(pcm_len),
  p_pcm_len     : pcm_len,
  p_data        : libopus._malloc(data_len),
  p_data_len    : data_len,
  stringifyError: function (errId) {
    return libopus.Pointer_stringify(libopus._opus_strerror(errId));
  }
};
/**
 * Encoding mode.
 * @readonly
 * @enum {number}
 */
var Application = {
  VOIP               : 2048,
  AUDIO              : 2049,
  RESTRICTED_LOWDELAY: 2051
};

var p_pcm   = utils.p_pcm;
var p_data  = utils.p_data;
var bufSize = 4096

function floatTo16BitPCM(input) {
  var output = new Int16Array(input.length);
  for (var i = 0, len = input.length; i < len; i++) {
    var s     = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
  return output;
}

/**
 * Encoder for opus streams.
 *
 * @param {object} [opts={}] - Options for the encoder
 * @param {(8000|12000|16000|24000|48000)} [opts.sampleRate=16000] - Sampling rate of input signal (Hz)
 * @param {(8000|12000|16000|24000|48000)} [opts.originSampleRate=16000] - Sampling rate of input signal (Hz)
 * @param {boolean} [opts.flush=false] - Number of (interleaved) channels
 * @param {number} [opts.channels=1] - Number of (interleaved) channels
 * @param {Application} [opts.application=AUDIO] - Encoding mode
 * @param {boolean} [opts.unsafe=false] - Mark this encoder as unsafe.<br>
 *    Encoders in unsafe mode generally operate faster.<br>
 *    Warning: {@link #destroy()} MUST be called on an unsafe encoder before
 *    it is garbage collected. Otherwise it will leak memory.
 * @constructor
 */
function Encoder(opts) {
  // Allow use without new
  if (!(this instanceof Encoder)) return new Encoder(opts);
  opts.sampleRate       = opts.sampleRate || 16000;
  opts.originSampleRate = opts.originSampleRate || 16000;
  opts.channels         = opts.channels || 1;
  opts.application      = opts.application || Application.AUDIO;
  opts.unsafe           = opts.unsafe || false;
  
  if (opts.channels < 1 || opts.channels > 2) {
    // throw "channels must be either 1 or 2";
    postMessage({cmd: 'error', data: "channels must be either 1 or 2"});
  }
  if ([8000, 12000, 16000, 24000, 48000].indexOf(opts.sampleRate) === -1) {
    // throw "rate can only be 8k, 12k, 16k, 24k or 48k";
    postMessage({cmd: 'error', data: "rate can only be 8k, 12k, 16k, 24k or 48k"});
  }
  if (opts.application !== Application.VOIP &&
    opts.application !== Application.AUDIO &&
    opts.application !== Application.RESTRICTED_LOWDELAY) {
    // throw "invalid application type";
    postMessage({cmd: 'error', data: "invalid application type"});
  }
  
  this.flush        = opts.flush;
  this._rate        = opts.sampleRate;
  this._ORate       = opts.originSampleRate;
  this._channels    = opts.channels;
  this._application = opts.application;
  this._unsafe      = opts.unsafe;
  this.resampler    = new Resampler(this._ORate, this._rate, this._channels)
  
  // Allocate space for the encoder state
  var size = libopus._opus_encoder_get_size(this._channels);
  var enc  = libopus._malloc(size);
  // Initialize the encoder
  var ret  = libopus._opus_encoder_init(enc, this._rate, this._channels, this._application);
  if (ret !== 0) {
    // Free allocated space and throw error
    libopus._free(enc);
    postMessage({cmd: 'error', data: utils.stringifyError(ret)});
  }
  // In unsafe mode, that's it. However in safe mode, we copy the state
  // to a local buffer and free our allocated memory afterwards
  if (this._unsafe) {
    this._state = enc;
  } else {
    this._state = libopus.HEAPU8.slice(enc, enc + size);
    libopus._free(enc);
  }
}

/**
 * Calls the specified function with the state loaded into memory.
 *
 * @param func - The function to be called
 * @returns The return value of func
 */
Encoder.prototype._withState = function (func) {
  if (this._unsafe) {
    // Unsafe mode already has the state stored in memory
    return func(this._state);
  } else {
    // Store state in memory
    var p = libopus._malloc(this._state.length);
    libopus.HEAPU8.set(this._state, p);
    
    // Call function
    try {
      return func(p);
    } finally {
      // Retrieve state from memory
      this._state.set(libopus.HEAPU8.subarray(p, p + this._state.length));
      libopus._free(p);
    }
  }
};

/**
 * Destroy this encoder.
 * This method should only be called if this encoder is in unsafe mode.
 * Any subsequent calls to any encode method will result in undefined behavior.
 */
Encoder.prototype.destroy = function () {
  if (this._unsafe) {
    libopus._free(this._state);
  }
};

/**
 * Encodes an array of (interleaved) pcm samples.
 * One frame must be exatly 2.5, 5, 10, 20, 40 or 60ms.
 *
 * @param {Int16Array|Float32Array} pcm - Input samples
 * @returns {Buffer} The encoded output
 */
Encoder.prototype.encode = function (pcm) {
  var samples = pcm.length / this._channels;
  return this._withState(function (p_enc) {
    var encode;
    /*if (pcm instanceof Float32Array) {
     if (pcm.length * 4 > utils.p_pcm_len) {
     throw new Error('pcm array too large');
     }
     libopus.HEAPF32.set(pcm, p_pcm >> 2);
     encode = libopus._opus_encode_float.bind(libopus);
     } else */
    if (pcm instanceof Int16Array) {
      if (pcm.length * 2 > utils.p_pcm_len) {
        // throw new Error('pcm array too large');
        postMessage({cmd: 'error', buf: 'pcm array too large'});
      }
      libopus.HEAP16.set(pcm, p_pcm >> 1);
      encode = libopus._opus_encode.bind(libopus);
    } else {
      // throw new TypeError('pcm must be Int16Array');
      postMessage({cmd: 'error', buf: 'pcm must be Int16Array'});
    }
    var len = encode(p_enc, p_pcm, samples, p_data, utils.p_data_len);
    if (len < 0) {
      // throw new Error(utils.stringifyError(len));
      postMessage({cmd: 'error', buf: utils.stringifyError(len)});
    }
    return new Uint8Array(libopus.HEAPU8.subarray(p_data, p_data + len));
  });
};

/**
 * Creates a transform stream from this encoder.
 * Since the stream always receives a Buffer object, the actual sample
 * type has to be specified manually.
 *
 * @param [('Float32'|'Int16')] mode - Type of sample input
 * @returns {EncoderStream}
 */
/*
 Encoder.prototype.stream = function (mode) {
 return new EncoderStream(this, mode);
 };
 
 function EncoderStream(encoder, mode) {
 Transform.call(this, {});
 
 this._encoder = encoder;
 if (mode == 'Float32') {
 this._mode = Float32Array;
 } else if (mode == 'Int16') {
 this._mode = Int16Array;
 } else {
 throw new TypeError('mode cannot be ' + mode);
 }
 }
 util.inherits(EncoderStream, Transform);
 
 EncoderStream.prototype._transform = function (chunk, encoding, callback) {
 chunk = new this._mode(chunk.buffer, chunk.byteOffset,
 chunk.byteLength / this._mode.BYTES_PER_ELEMENT);
 var result;
 try {
 result = this._encoder.encode(chunk);
 } catch (err) {
 return callback(err);
 }
 callback(null, result);
 };
 */

Encoder.Application = Application;

var opus_encoder, size = 320, endTemp, opusArray = [], sliceSize = 20, usePcm = false;

function encodePcm(pcm, end) {
  pcm = opus_encoder.resampler.sample(pcm);
  // opus_encoder.resampler.resampler(bufSize);
  if (pcm instanceof Float32Array) {
    pcm = floatTo16BitPCM(pcm);
  }
  if (usePcm) {
    return new Uint8Array(pcm.buffer)
  }
  var ret = [];
  if (endTemp && endTemp.length) {
    var tp = new Int16Array(endTemp.length + pcm.length);
    tp.set(endTemp);
    tp.set(pcm, endTemp.length);
    pcm = tp;
  }
  endTemp = null;
  
  for (var i = 0, len = Math.ceil(pcm.length / size); i < len; i++) {
    var enc, temp = pcm.subarray(i * size, (i + 1) * size);
    if (temp.length < size) {
      if (end) {
        var endPcm = new Int16Array(size);
        endPcm.set(temp);
        temp = endPcm;
      } else {
        endTemp = temp;
        break;
      }
    }
    enc = opus_encoder.encode(temp);
    ret.push.apply(ret, new Uint8Array(new Int16Array([enc.length]).buffer));
    ret.push.apply(ret, enc);
  }
  return new Uint8Array(ret);
}

onmessage = function (e) {
  switch (e.data.cmd) {
    case 'encode':
      opusArray.push(encodePcm(e.data.pcm));
      if (opus_encoder.flush && opusArray.length >= sliceSize) {
        postMessage({cmd: 'flush', buf: opusArray.splice(0, sliceSize)});
      }
      break;
    case 'finish':
      opusArray.push(encodePcm(e.data.buf || [], true));
      postMessage({cmd: 'end', buf: opusArray});
      opusArray = [];
      break;
    case 'init':
      opusArray    = [];
      var config   = e.data.config || {}
      usePcm       = config.usePcm
      opus_encoder = new Encoder(config);
      postMessage({cmd: 'init'});
      break;
    case 'destroy':
      opus_encoder.destroy();
      opusArray = [];
      postMessage({cmd: 'destroy'});
      break;
  }
};