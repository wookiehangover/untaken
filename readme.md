# when.works

> Find time for your next meeting, fast.

[![wercker status](https://app.wercker.com/status/6f6722eb395e5075e60e2d065b4bec0a/m "wercker status")](https://app.wercker.com/project/bykey/6f6722eb395e5075e60e2d065b4bec0a)

This app connects to a user's Google Calendar account and returns a
listing of what time's they're availabile for a given date range. I
found myself doing this manually quite often, so I made a small app to
do it for me.

## Setup

* Node.js >= 0.10
* Redis >= 2.4
* Grunt >= 0.4

`config/default.js` and `config/production.js` are not checked into the
repo. Take a look at `config/config-example.js` for what should go in
there.

### Install

```
$ npm install
```

### Browserify builds

```
$ npm run watch
```

### FE test builds

```
$ npm run watch-tests
```

### Building for production

```
$ make build
```

