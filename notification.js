let util = require('util')
let webPush = require('web-push')
// let atob = require('atob')

let VAPID_SUBJECT = 'mailto:theoutlander@live.com'
let VAPID_PUBLIC_KEY = 'BA1aL9i3qIUjA_a3nHlTfkmJcUEPEfUgaiC6ijmjQbOvFrS8Swqo0aiw5fbwy_VQQEnch0hZArcQvoX4gghN5AY'
let VAPID_PRIVATE_KEY = 'JNOSSjzK27qfpAWVTT7yaN_dVIe5Xw4yvStuqh9hP5U'

//Auth secret used to authentication notification requests.
let AUTH_SECRET = 'THIS IS A SECRET'

let subscribers = [{
  endpoint: 'https://fcm.googleapis.com/fcm/send/cs4Rgt13Dvw:APA91bHZh4OG73zrvBhkWNen1HZpMRXd_Sc-sm0qBsdt9jSVisNH81_3bbSgQ75BnyNJWQuZteoNHzHLjQKWmaevFK7ZLSmrKJSlJHaudQRpPADtFdiVZbKBs6Fd0WsDQ-lEIaYAtzfW',
  keys:
    {
      p256dh: 'BDyibr9jTPUmhwj1q/Vf46hetxllSEHsikVMOtOwW+wtRH51ICb7PgGA+YOy1tk/0EmRIUn9Wl2Fx2akFu5MJl4=',
      auth: 'NkYZjNaAaA4duf8dkKNadg=='
    }
}
]

class Notification {

  constructor () {
    webPush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )
  }

  registerRoutes (app) {
    this.__registerNotifyAll(app)
    this.__registerSubscribe(app)
    this.__registerUnsubscribe(app)
  }

  __registerSubscribe (app) {
    app.post('/subscribe', function (req, res) {
      let endpoint = req.body['notificationEndPoint']
      let publicKey = req.body['publicKey']
      let auth = req.body['auth']

      let pushSubscription = {
        endpoint: endpoint,
        keys: {
          p256dh: publicKey,
          auth: auth
        }
      }

      console.log(pushSubscription)
      subscribers.push(pushSubscription)

      res.send('Subscription accepted!')
    })

    app.post('/unsubscribe', function (req, res) {
      let endpoint = req.body['notificationEndPoint']

      subscribers = subscribers.filter(subscriber => { endpoint == subscriber.endpoint })

      res.send('Subscription removed!')
    })
  }

  __registerUnsubscribe (app) {
    app.post('/unsubscribe', function (req, res) {
      let endpoint = req.body['notificationEndPoint']

      subscribers = subscribers.filter(subscriber => { endpoint == subscriber.endpoint })

      res.send('Subscription removed!')
    })
  }

  __registerNotifyAll (app) {
    app.get('/notify/all', function (req, res) {
      // if (req.get('auth-secret') != AUTH_SECRET) {
      //   console.log('Missing or incorrect auth-secret header. Rejecting request.')
      //   return res.sendStatus(401)
      // }

      let message = req.query.message || `Willy Wonka's chocolate is the best!`
      let clickTarget = req.query.clickTarget || `http://www.favoritemedium.com`
      let title = req.query.title || `Push notification received!`

      subscribers.forEach(pushSubscription => {
        //Can be anything you want. No specific structure necessary.
        let payload = JSON.stringify({message: message, clickTarget: clickTarget, title: title})

        webPush.sendNotification(pushSubscription, payload, {}).then((response) => {
          console.log('Status : ' + util.inspect(response.statusCode))
          console.log('Headers : ' + JSON.stringify(response.headers))
          console.log('Body : ' + JSON.stringify(response.body))
        }).catch((error) => {
          console.log('Status : ' + util.inspect(error.statusCode))
          console.log('Headers : ' + JSON.stringify(error.headers))
          console.log('Body : ' + JSON.stringify(error.body))
        })

      })

      res.send('Notification sent!')
    })
  }
}

module.exports = new Notification()