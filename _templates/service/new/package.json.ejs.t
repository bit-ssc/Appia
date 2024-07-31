---
to: ee/apps/<%= name %>/package.json
---
{
	"name": "@rocket.chat/<%= name.toLowerCase() %>",
	"private": true,
	"version": "0.1.0",
	"description": "Rocket.Chat service",
	"scripts": {
		"build": "tsc -p tsconfig.json",
		"ms": "TRANSPORTER=${TRANSPORTER:-TCP} MONGO_URL=${MONGO_URL:-mongodb://localhost:3001/meteor} ts-node --files src/service.ts",
		"test": "echo \"Error: no test specified\" && exit 1",
		"lint": "eslint src",
		"typecheck": "tsc --noEmit --skipLibCheck -p tsconfig.json"
	},
	"keywords": [
		"rocketchat"
	],
	"author": "Rocket.Chat",
	"dependencies": {
		"@rocket.chat/core-services": "workspace:^",
		"@rocket.chat/core-typings": "workspace:^",
		"@rocket.chat/emitter": "0.31.22",
		"@rocket.chat/model-typings": "workspace:^",
		"@rocket.chat/models": "workspace:^",
		"@rocket.chat/rest-typings": "workspace:^",
		"@rocket.chat/string-helpers": "0.31.22",
		"@types/node": "^14.18.21",
		"ejson": "^2.2.2",
		"eventemitter3": "^4.0.7",
		"fibers": "^5.0.3",
		"mem": "^8.1.1",
		"moleculer": "^0.14.21",
		"mongodb": "^4.12.1",
		"nats": "^2.4.0",
		"pino": "^8.4.2",
		"polka": "^0.5.2"
	},
	"devDependencies": {
		"@rocket.chat/eslint-config": "workspace:^",
		"@types/eslint": "^8.4.10",
		"@types/polka": "^0.5.4",
		"eslint": "^8.29.0",
		"ts-node": "^10.9.1",
		"typescript": "~4.6.4"
	},
	"main": "./dist/ee/apps/<%= name %>/src/service.js",
	"files": [
		"/dist"
	],
	"volta": {
		"node": "14.19.3"
	}
}

