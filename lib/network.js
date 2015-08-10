var fs = require('fs')
var url = require('url') 
var http = require('http')
var https = require('https')

var Network = function(){ 
	this._protocols = {
		http: http,
		https: https
	} 

	return this
} 
Network.prototype._request = function(options, json, callback){  
	var self = this
	
	callback = callback ? callback : function(){}
	var _url = url.parse(options.url ? options.url : options)
	var protocol = _url.protocol.substr(0, _url.protocol.length - 1)
	var port  
	if(_url.protocol == 'http:'){
		port = 80
	}
	if(_url.protocol == 'https:'){
		port = 443 
	}  
	if(options.port){
		port = options.port
	}
	if(_url.host == null){
		callback(undefined, undefined, new Error())
		return
	}
	if(typeof options == 'string'){  
 		req_options = {
			host: _url.host,
			path: _url.pathname, 
			port: port, 
			method: options.method			
		} 
	}
	else{ 
		var queryStr = _url.query ? (_url.query + '&') : ''  
		if(options.query !== undefined){ 
			queryStr += self._renderUrlencoded(options.query) 
		}  
		req_options = {
			host: _url.host,
			path: _url.pathname + (queryStr ? '?' + queryStr : ''), 
			port: port, 
			method: options.method, 
			headers: options.headers			
		}
	}   
	var req = this._protocols[protocol].request(req_options, function(response){ 
		if(options.pipe !== undefined){ 
			response.pipe(options.pipe)
		}
		var str = ''
		response.on('data', function(chunk){
			str += chunk  
		})
		response.on('end', function(){ 
			if(json == true){  
				try{
					var obj = JSON.parse(str) 
				} 
				catch(e){  
					callback(undefined, undefined, e)
					return
				} 
				callback(obj, response)
				return
			}
			else{ 
				callback(str, response)
			}
			answered = true
		}) 

	})   
	if(req_options.method == 'POST' && options.multipart){ 
		var data = options.multipart
		var names = Object.keys(options.multipart) 
		var boundaryKey = Math.random().toString(16) 
		var body = this._renderMultipartBody(names, data, boundaryKey)
		var length = 0 
		
		req.setHeader('Content-Type', 'multipart/form-data; boundary="'+boundaryKey+'"')
			
		body.forEach(function(part){
			length = length + Buffer.byteLength(part)
  		})
		names.forEach(function(name){
			if(data[name].value !== undefined){
				length = length + self._getFilesizeInBytes(data[name].value.path) 
			}
		}) 
		req.setHeader('Content-Length', length + (16 * (names.length - 1) ) + 8 + Buffer.byteLength(boundaryKey))    
		
		this._sendMultipartParts(boundaryKey,body, data, names,req, 0)   
	} 
	else{
		if(req_options.method == 'POST' && options.form){
			req.setHeader('Content-Type', 'application/x-www-form-urlencoded') 
			var body = self._renderUrlencoded(options.form)
			req.setHeader('Content-Length', Buffer.byteLength(body) ) 
			req.end(body)
		}
		else{
			req.setHeader('Content-Length', 0 ) 
			req.end()
		}
	}
	req.on('error', function(e) {  
		callback(undefined, undefined, e)
	}) 
}
Network.prototype._renderMultipartBody = function(names, data, boundaryKey){
	var body = []
	names.forEach(function(name, i){
		if(data[name].value !== undefined){ 
			body[i] =  '--' + boundaryKey + '\r\n'
					+ 'Content-Type: '+data[name].contentType+'\r\n' 
			 		+ 'Content-Disposition: form-data; name="'+name+'"; filename="'+data[name].filename+'"\r\n'
			 		+ 'Content-Transfer-Encoding: binary\r\n\r\n'
		}
		else{
			body[i] =  '--' + boundaryKey + '\r\n' 
			 		+ 'Content-Disposition: form-data; name="'+name+'"\r\n\r\n'
			 		+ data[name]
			 		
		}
	})  
	return body
} 
Network.prototype._sendMultipartParts = function(boundaryKey,body, data, names,req, i){ 
	var self = this
	
	req.write('\r\n' + body[i])
	
	if(data[names[i]].value !== undefined){ 
		data[names[i]].value
		.on('end', function(){ 
			if(i+1 <= names.length - 1){
				req.write('\r\n--' + boundaryKey)  
				self._sendMultipartParts(boundaryKey,body, data, names,req,i+1)
			}
			else{ 
				req.end('\r\n--' + boundaryKey + '--')
			}
		})
		.pipe(req, {end: false})
	}
	else{
		if(i+1 <= names.length - 1){
			req.write('\r\n--' + boundaryKey) 
			self._sendMultipartParts(boundaryKey,body, data, names,req,i+1)
		}
		else{ 
			req.end('\r\n--' + boundaryKey + '--')
		}
	} 
}
Network.prototype._getFilesizeInBytes = function(filename) {
 var stats = fs.statSync(filename)
 var fileSizeInBytes = stats["size"]
 return fileSizeInBytes
}
Network.prototype._renderUrlencoded = function(query){
	var queryStr = ''
	for (var key in query) {
	    if (queryStr != '') {
	        queryStr += '&'
	    }
	    queryStr += key + '=' + encodeURIComponent(query[key])
	}
	
	return queryStr	
}

Network.prototype.get = function(options, json, callback){  
	options.method = 'GET' 
	this._request(options, json, callback)
}
Network.prototype.post = function(options, json, callback){
	options.method = 'POST' 
	this._request(options, json, callback)	
}  




module.exports = new Network()


  