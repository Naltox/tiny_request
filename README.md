## Simple to use


```js
var req = require('tiny_request')

req.get('http://google.com', function(body, response, err){
	if (!err && response.statusCode == 200) {  
		console.log(body) 
	} 
})
```
