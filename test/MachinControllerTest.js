'use strict'
const machineRouter = require('../routes/MachineRoutes')
const expect = require('chai').expect

describe('Router', function () {
  it('should return a function with router methods', function () {
    const router = machineRouter
    const routes = router.stack

    expect(routes[0].route.path).to.equal('/on/:id')
    expect(routes[1].route.path).to.equal('/off/:id')
  })

  it('should support dynamic routes', function (done) {
    const router = machineRouter

    router.handle({ url: '/on/123231', method: 'GET' }, { end: done })
    router.handle({ url: '/on/awdfae', method: 'GET' }, { end: done })
  })

  it('should handle blank URL', function (done) {
    const router = new Router()

    router.use(function (req, res) {
      throw new Error('should not be called')
    })

    router.handle({ url: '', method: 'GET' }, {}, done)
  })

  it('should handle missing URL', function (done) {
    const router = new Router()

    router.use(function (req, res) {
      throw new Error('should not be called')
    })

    router.handle({ method: 'GET' }, {}, done)
  })

  describe('.handle', function () {
    it('should dispatch', function (done) {
      const router = new Router()

      router.route('/foo').get(function (req, res) {
        res.send('foo')
      })

      const res = {
        send: function (val) {
          assert.strictEqual(val, 'foo')
          done()
        }
      }
      router.handle({ url: '/foo', method: 'GET' }, res)
    })
  })

  describe('error', function () {
    it('should skip non error middleware', function (done) {
      const router = new Router()

      router.get('/foo', function (req, res, next) {
        next(new Error('foo'))
      })

      router.get('/bar', function (req, res, next) {
        next(new Error('bar'))
      })

      router.use(function (req, res, next) {
        assert(false)
      })

      router.use(function (err, req, res, next) {
        assert.equal(err.message, 'foo')
        done()
      })

      router.handle({ url: '/foo', method: 'GET' }, {}, done)
    })

    it('should handle throwing inside routes with params', function (done) {
      const router = new Router()

      router.get('/foo/:id', function () {
        throw new Error('foo')
      })

      router.use(function (req, res, next) {
        assert(false)
      })

      router.use(function (err, req, res, next) {
        assert.equal(err.message, 'foo')
        done()
      })

      router.handle({ url: '/foo/2', method: 'GET' }, {}, function () {})
    })

    it('should handle throwing in handler after async param', function (done) {
      const router = new Router()

      router.param('user', function (req, res, next, val) {
        process.nextTick(function () {
          req.user = val
          next()
        })
      })

      router.use('/:user', function (req, res, next) {
        throw new Error('oh no!')
      })

      router.use(function (err, req, res, next) {
        assert.equal(err.message, 'oh no!')
        done()
      })

      router.handle({ url: '/bob', method: 'GET' }, {}, function () {})
    })

    it('should handle throwing inside error handlers', function (done) {
      const router = new Router()

      router.use(function (req, res, next) {
        throw new Error('boom!')
      })

      router.use(function (_err, req, res, next) {
        throw new Error('oops')
      })

      router.use(function (err, req, res, next) {
        assert.equal(err.message, 'oops')
        done()
      })

      router.handle({ url: '/', method: 'GET' }, {}, done)
    })
  })

  describe('.param', function () {
    it('should call param function when routing VERBS', function (done) {
      const router = new Router()

      router.param('id', function (req, res, next, id) {
        assert.equal(id, '123')
        next()
      })

      router.get('/foo/:id/bar', function (req, res, next) {
        assert.equal(req.params.id, '123')
        next()
      })

      router.handle({ url: '/foo/123/bar', method: 'get' }, {}, done)
    })

    it('should call param function when routing middleware', function (done) {
      const router = new Router()

      router.param('id', function (req, res, next, id) {
        assert.equal(id, '123')
        next()
      })

      router.use('/foo/:id/bar', function (req, res, next) {
        assert.equal(req.params.id, '123')
        assert.equal(req.url, '/baz')
        next()
      })

      router.handle({ url: '/foo/123/bar/baz', method: 'get' }, {}, done)
    })

    it('should only call once per request', function (done) {
      let count = 0
      const req = { url: '/foo/bob/bar', method: 'get' }
      const router = new Router()
      const sub = new Router()

      sub.get('/bar', function (req, res, next) {
        next()
      })

      router.param('user', function (req, res, next, user) {
        count++
        req.user = user
        next()
      })

      router.use('/foo/:user/', new Router())
      router.use('/foo/:user/', sub)

      router.handle(req, {}, function (err) {
        if (err) return done(err)
        assert.equal(count, 1)
        assert.equal(req.user, 'bob')
        done()
      })
    })

    it('should call when values differ', function (done) {
      let count = 0
      const req = { url: '/foo/bob/bar', method: 'get' }
      const router = new Router()
      const sub = new Router()

      sub.get('/bar', function (req, res, next) {
        next()
      })

      router.param('user', function (req, res, next, user) {
        count++
        req.user = user
        next()
      })

      router.use('/foo/:user/', new Router())
      router.use('/:user/bob/', sub)

      router.handle(req, {}, function (err) {
        if (err) return done(err)
        assert.equal(count, 2)
        assert.equal(req.user, 'foo')
        done()
      })
    })
  })
})
