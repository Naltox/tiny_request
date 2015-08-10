Tiny module for http requests with no dependencies

## Simple to use


```js
var req = require('tiny_request')

req.get('http://google.com', function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```
## Examples

- [JSON](#json)
- [GET](#get)  
- [POST Multipart](#postmultipart)
- [POST Froms](#postfroms)
- [Stream](#Stream)
 
## JSON

To automatically parse JSON you just need to pass JSON parameter.

Example: 

```js 
req.get({ url: 'http://test.com/json', json: true}, function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) //body now is parsed JSON object
	} 
})
```

## GET

```js 
req.get({ url: 'http://test.com', query: { test: 'test' }}, function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```
Where query is GET parameters object

Also you can pass port parameter, for example: 

```js 
req.get({ url: 'http://test.com', port: 8080}, function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```

## POST Multipart

```js 
var data = {
	image: {
		value: fs.createReadStream('photo.png'), 
		filename: 'photo.png',
		contentType: 'image/png'			
	},
	test: 'test'
}

req.post({
	url: 'http://test.com',
	query: { test: 'test' },
 	multipart: data 
}, function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```

## POST Forms

```js 
var form = {
	test: 'test'
}

req.post({ url: 'http://test.com', form: form}, function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```

## Stream

```js  
net.get({url: url, pipe: stream}) 
```

