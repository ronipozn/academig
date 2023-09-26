var db = require('../db.ts'),
    async = require('async'),
    backhelp = require("./backend_helpers.ts");

var groups = require("./groups.ts");

var ObjectID = require('mongodb').ObjectID;

if (process.env.PORT) {
  var stripe = require("stripe")("sk_live_cX9wuWcR9lIBXPhAh206GjKb");
} else {
  var stripe = require("stripe")("sk_test_7EVILWvlgJHlUNOh58DBJVe4");
}

import {objectMini, groupComplex} from '../models/shared.ts';

////////////////////////////////////
////////////////////////////////////
/////////////// Intents ////////////
////////////////////////////////////
////////////////////////////////////

// https://stripe.com/docs/payments/checkout/subscriptions/updating
export function setup_intents(seti: string, callback) {
  // console.log('seti',seti)
  stripe.setupIntents.retrieve(seti, function(err, setupIntent) {
    // console.log('setupIntent',setupIntent)
    stripe.paymentMethods.attach(
      setupIntent.payment_method,
      {
        customer: setupIntent.metadata.customer_id,
      },
      function(err, paymentMethod) {
        // console.log('paymentMethod',paymentMethod)
        callback(err)
      }
    );
  });
}

////////////////////////////////////
////////////////////////////////////
//////////// Create Source /////////
////////////////////////////////////
////////////////////////////////////

export function create_source(host: string, mode: number, stripeId: string, groupIndex: groupComplex, callback) {
  const link = (mode==1 || mode==2) ?
    "http://"+host+'/'+(groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link)+'/settings' :
    "http://"+host+'/settings';

  console.log('link',link)

  // billing_address_collection: 'required',
  stripe.customers.retrieve(stripeId, function(err, customer) {
    console.log('customerId',customer.id)
    console.log('subscriptionsId',customer.subscriptions.data[0].id)
    console.log('subscriptions',customer.subscriptions)
    // console.log('subscriptions_len',customer.subscriptions.data.length)

    let metadata;

    if (customer.subscriptions.data.length>0) {
      metadata = {
        customer_id: customer.id,
        subscription_id: customer.subscriptions.data[0].id
      }
    } else {
      metadata = {
        customer_id: customer.id
      }
    }

    stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'setup',
        setup_intent_data: {
          metadata: metadata
        },
        // success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        success_url: link,
        cancel_url: link
        // cancel_url: link + '/cancel'
      }, function(err, data) {
        callback(err, data)
    })
  })
}

////////////////////////////////////
////////////////////////////////////
////////// Create Product //////////
////////////////////////////////////
////////////////////////////////////

export function create_product(name: string, callback) {
  // const product = await stripe.products.create({
  //   name: 'Starter Dashboard',
  // });
  stripe.products.create(
    {
      name: name,
    }, function(err, product) {
      console.log('data',product)
      callback(err, product)
  })
}

////////////////////////////////////
////////////////////////////////////
////////// Create Pricing //////////
////////////////////////////////////
////////////////////////////////////

export function create_pricing(productId: string, price: number, callback) {
  // const price = await stripe.prices.create({
  //   product: '{{PRODUCT_ID}}',
  //   unit_amount: 1000,
  //   currency: 'usd',
  //   recurring: {
  //     interval: 'month',
  //   },
  // });
  stripe.prices.create(
    {
      product: productId,
      unit_amount: price*100,
      currency: 'usd',
    }, function(err, product) {
      callback(err, product)
  })
}

////////////////////////////////////
////////////////////////////////////
///// Create One-Time Payment //////
////////////////////////////////////
////////////////////////////////////

export function create_deal_payment(host: string, dealId: string, stripeId: string, priceId: string, quantity: number, callback) {
  var success_url: string;
  var cancel_url: string;

  success_url = "http://"+host+'/manage-deals#'+dealId;
  cancel_url = "http://"+host+'/manage-deals/decline#'+dealId;

  stripe.customers.retrieve(stripeId, function(err, customer) {
    stripe.checkout.sessions.create(
      {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: quantity,
        }],
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
      }, function(err, confirmation) {
        console.log('err',err)
        // console.log('confirmation',confirmation)
        callback(err, confirmation)
    })
  })
}

////////////////////////////////////
////////////////////////////////////
/////// Create Subscriptions ///////
////////////////////////////////////
////////////////////////////////////

export function create_subscription(host: string, mode: number, period: number, type: number, quantity: number, stripeId: string, groupIndex: groupComplex, callback) {
  var planId, link: string;
  var trial_period_days: number = 0;

  console.log('type',type,'mode',mode,'period',period)

  stripe.customers.retrieve(stripeId, function(err, customer) {

    // TBD: check customer payment card / existing subscription: if exist => update subscriptopn

    if (type==0) { // Free

      // console.log('subscription',customer.subscriptions.data[0].id)
      stripe.subscriptions.del(
        customer.subscriptions.data[0].id,
        function(err, confirmation) {
          console.log('create_subscription',err)
          callback(err, confirmation, planId)
        }
      );

    } else {

      if (type==1) { // PRO

        switch (mode) {
          case 0: { // Academig PRO
            if (process.env.PORT) { // PRODUCTION
              planId = (period==0) ? 'price_1I1z2wHfJudkfqK1JqMPO7ac' : 'price_1I1z2wHfJudkfqK1pQu72of5';
            } else { // DEVELOPMENT
              planId = (period==0) ? 'price_1HtxkWHfJudkfqK1Lc6LyBZd' : 'price_1HO9PPHfJudkfqK1b125VOSK';
            }
            trial_period_days = 7;
            link = "http://"+host+'/search';
          };
          break;
          case 1: { // Academig Lab Tools PRO
            if (process.env.PORT) { // PRODUCTION
              planId = (period==0) ? 'price_1I1z4pHfJudkfqK1l2354CNT' : 'price_1I1z4pHfJudkfqK1dnk2YJ88';
            } else { // DEVELOPMENT
              planId = (period==0) ? 'price_1HNmSpHfJudkfqK14vOHTD8v' : 'price_1HO9QKHfJudkfqK1Ics7Y4e3';
            }
            trial_period_days = 60;
            link = "http://"+host+'/'+(groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link)+'/tools';
          };
          break;
        }

      } else if (type==2) { // PRO+

        switch (mode) {
          case 0: { // Academig PRO & Mentors
            if (process.env.PORT) { // PRODUCTION
              planId = (period==0) ? 'price_1I1z3nHfJudkfqK166yHhW81' : 'price_1I1z3nHfJudkfqK19u5r8nl1';
            } else { // DEVELOPMENT
              planId = (period==0) ? 'price_1HxAZIHfJudkfqK1vcz2dp5d' : 'price_1HxAYmHfJudkfqK1VcLccH7f';
            }
            trial_period_days = 7;
            link = "http://"+host+'/search';
            break;
          };
          case 1: { // Academig Labs Suggestions PRO
            if (process.env.PORT) { // PRODUCTION
              planId = (period==0) ? 'price_1I1z4jHfJudkfqK1mWXrfBcV' : 'price_1I1z4jHfJudkfqK1JaZLw9Yw';
            } else { // DEVELOPMENT
              planId = (period==0) ? 'price_1HNmSQHfJudkfqK1BHbKORzl' : 'price_1HO9RRHfJudkfqK1ahPGjf9H';
            }
            trial_period_days = 7;
            link = "http://"+host+'/'+(groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link)+'/suggestions';
            break;
          };
        }

      }

      console.log('link',link,'planId',planId,'stripeId',stripeId)
      // stripe.subscriptions.update(customer.subscriptions.data[0].id
      stripe.checkout.sessions.create(
        {
          customer: customer.id,
          // billing_address_collection: 'required',
          // customer_email: 'customer@example.com',
          payment_method_types: ['card'],
          subscription_data: {
            trial_period_days: trial_period_days,
            items: [{
              plan: planId,
            }],
          },
          success_url: link,
          cancel_url: link
          // cancel_url: link+'/cancel'
        }, function(err, data) {
          console.log('err_create_subscription',err)
          callback(err, data, planId)
      })

    }

  })
}

export function create_position_subscription(userId: string, host: string, build: number, filter: number, standout: number, stripeId: string, groupIndex: groupComplex, groupEmail: string, itemId: string, callback) {
  var success_url: string;
  var cancel_url: string;

  const groupLink: string = groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link;

  if (userId) { // User
    // TBD FIX Build (Delete)
    if (build==0) {
      success_url = "http://"+host+'/'+groupLink+'/jobs/'+itemId;
      cancel_url = "http://"+host+'/'+groupLink+'/jobs/'+itemId;
      // cancel_url = "http://"+host+'/'+groupLink+'/jobs/'+itemId+'/cancel';
    } else {
      success_url = "http://"+host+'/'+groupLink+'/jobs/'+itemId;
      cancel_url = "http://"+host+'/'+groupLink+'/jobs/'+itemId;
      // cancel_url = "http://"+host+'/'+groupLink+'jobs'+itemId+'/cancel';
    }
  } else { // Non-User
    // success_url = "http://"+host+'/post-job/confirm/'+itemId+'#roni.pozner@gmail.com';
    success_url = "http://"+host+'/post-job/confirm/'+itemId+'#'+groupEmail;
    cancel_url = "http://"+host+'/post-job';
    // cancel_url = "http://"+host+'/post-job/cancel';
  }

  stripe.customers.retrieve(stripeId, function(err, customer) {
    var standoutIds: string[];

    if (process.env.PORT) { // PRODUCTION
       standoutIds = [
         'price_1I1z52HfJudkfqK1O1yvb0WU',
         'price_1I1z52HfJudkfqK1EE1HNPSA',
         'price_1I1z52HfJudkfqK1h9cwlALl',
         'price_1I1z52HfJudkfqK1WEQMQezc'
       ]
    } else { // DEVELOPMENT
      standoutIds = [
        'price_1HO40GHfJudkfqK1SyOHZBl2',
        'price_1HO41yHfJudkfqK1jVnODJBq',
        'price_1HO42lHfJudkfqK1p6bmijLQ',
        'price_1HO432HfJudkfqK15LMf4gxu'
      ];
    }

    var planItems = [{"plan": standoutIds[standout]}]

    if (filter) planItems.push({"plan": (process.env.PORT) ? "price_1I1z5aHfJudkfqK15lKLMqqf" : "price_1HfrdIHfJudkfqK1yFoGGHcb"})
    if (build) planItems.push({"plan": (process.env.PORT) ? "price_1I1z4jHfJudkfqK1mWXrfBcV" : "price_1HNmSQHfJudkfqK1BHbKORzl"})

    console.log('planItems',planItems)
    console.log('build',build,'filter',filter)

    stripe.checkout.sessions.create(
      {
        customer: customer.id,
        // billing_address_collection: 'required',
        // customer_email: 'customer@example.com',
        payment_method_types: ['card'],
        subscription_data: {
          items: planItems
        },
        success_url: success_url,
        cancel_url: cancel_url,
      }, function(err, confirmation) {
        callback(err, confirmation)
    })

  })
}

export function create_service_subscription(userId: string, host: string, build: number, standout: number, stripeId: string, groupIndex: groupComplex, groupEmail: string, itemId: string, callback) {
  var success_url: string;
  var cancel_url: string;

  const groupLink: string = groupIndex.university.link + '/' + groupIndex.department.link + '/' + groupIndex.group.link;

  if (userId) { // User
    if (build==0) {
      success_url = "http://"+host+'/'+groupLink+'/services/'+itemId;
      cancel_url = "http://"+host+'/'+groupLink+'/services/'+itemId;
    } else {
      success_url = "http://"+host+'/'+groupLink+'/services/'+itemId;
      cancel_url = "http://"+host+'/'+groupLink+'/services/'+itemId;
    }
  } else { // Non-User
    success_url = "http://"+host+'/post-service/confirm/'+itemId+'#'+groupEmail;
    cancel_url = "http://"+host+'/post-service';
  }

  stripe.customers.retrieve(stripeId, function(err, customer) {
    var standoutIds: string[];

    if (process.env.PORT) { // PRODUCTION
      standoutIds = [
        'price_1I1z5vHfJudkfqK1TkTlgq20',
        'price_1I1z5vHfJudkfqK1yUCiusui',
        'price_1I1z5vHfJudkfqK1IXNDgurW'
      ]
    } else { // DEVELOPMENT
      standoutIds = [
        'price_1HtxuEHfJudkfqK1J5whQzdh',
        'price_1HtxuFHfJudkfqK1oU1l2hpN',
        'price_1HtxuEHfJudkfqK1b59jfDVS'
      ];
    }

    var planItems = [{"plan": standoutIds[standout]}]

    if (build) planItems.push({"plan": (process.env.PORT) ? "price_1I1z4jHfJudkfqK1mWXrfBcV" : "price_1HNmSQHfJudkfqK1BHbKORzl"})

    // console.log('planItems',planItems)

    stripe.checkout.sessions.create(
      {
        customer: customer.id,
        payment_method_types: ['card'],
        subscription_data: {
          items: planItems
        },
        success_url: success_url,
        cancel_url: cancel_url,
      }, function(err, confirmation) {
        console.log('err',err)
        // console.log('confirmation',confirmation)
        callback(err, confirmation)
    })

  })
}

// const standoutIds = ['plan_Gj9RdeaefKIi76', 'plan_GjBCs4mZkSvGGS', 'plan_GjBDu5xRt295g5', 'plan_GjBEU8VPgLMGud'];
// const standoutTitles = ['Standard', 'Good', 'Better', 'Best'];
// const standoutAmount = [99, 139, 159, 199];
// var line_items = [];
// line_items.push({
//   name: 'Job Posting: ' + standoutTitles[standout],
//   description: "Academig " + standoutTitles[standout] + " plan.",
//   amount: standoutAmount[standout]*100,
//   currency: 'usd',
//   quantity: 1
// });

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

export function pro_subscribe(stripeId: string, subscriptionId: string, planIndex: number, callback) {
  db.peoples.updateOne(
    { "stripe_id": stripeId },
    { $set:
      {
        "plan": planIndex,
        "sub_id": subscriptionId
      },
    }, function(err, res) {
      // TBD: send confirmation email: PRO / PRO + Mentoring
      callback(err)
    });
}

export function lab_pro_subscribe(stripeId: string, subscriptionId: string, callback) {
  db.groups.updateOne(
    { "stripe_id": stripeId },
    { $set:
      {
        "plan": 1,
        "sub_id": subscriptionId
      },
    }, function(err, res) {
      // TBD: send confirmation email
      callback(err)
    });
  // stripe.customers.retrieve(stripeId, function(err, customer) {
  //   if (customer.subscriptions && customer.subscriptions.data[0]) {
  //     stripe.subscriptions.update(customer.subscriptions.data[0].id, {
  //       cancel_at_period_end: false,
  //       items: [{ id: customer.subscriptions.data[0].items.data[0].id, plan: planId, quantity: quantity }]
  //     }).then(function(subscriptions) {
  //       callback(null, subscriptions)
  //     });
  //   } else {
  //     stripe.subscriptions.create({
  //       customer: stripeId,
  //       items: [ { plan: planId, quantity: quantity } ],
  //       trial_period_days: 0 // 7
  //     }).then(function(subscriptions) {
  //       callback(null, subscriptions)
  //     });
  //   }
  // })
}

export function ai_pro_subscribe(stripeId: string, subscriptionId: string, callback) {
  db.groups.updateOne(
    { "stripe_id": stripeId },
    { $set:
      {
        "buildPro": 2,
        "buildSubId": subscriptionId
      },
    }, function(err, res) {
      // TBD: send confirmation email
      callback(err)
    });
}

////////////////////////////////////
////////////////////////////////////
/////////// Plan + Payments ////////
////////////////////////////////////
////////////////////////////////////

export function user_plan(stripeId: string, mode: number, callback) {
  var sub, planName, customer_plan;

  stripe.customers.retrieve(stripeId, function(err, customer) {
    // console.log('user_plan',customer)
    sub = customer ? customer.subscriptions.data[0] : null;
    if (sub) {
      if (process.env.PORT) { // PRODUCTION
        switch (sub.plan.id) {
          case "price_1I1z3nHfJudkfqK166yHhW81": // PRO & Mentors
          case "price_1I1z3nHfJudkfqK19u5r8nl1":
            planName = 2; break;
          case "price_1I1z2wHfJudkfqK1JqMPO7ac": // PRO
          case "price_1I1z2wHfJudkfqK1pQu72of5":
            planName = 1; break;
          default:
            planName = 0;
        }
        // planName = (sub.plan.id=="plan_FEkfxvASc3fxnL" || sub.plan.id=="plan_FEkgayuUC0K5g3") ? 1 : 0;
      } else { // DEVELOPMENT
        switch (sub.plan.id) {
          case "price_1HxAYmHfJudkfqK1VcLccH7f": // PRO & Mentors
          case "price_1HxAZIHfJudkfqK1vcz2dp5d":
            planName = 2; break;
          case "price_1HtxkWHfJudkfqK1Lc6LyBZd": // PRO
          case "price_1HO9PPHfJudkfqK1b125VOSK":
            planName = 1; break;
          default:
            planName = 0;
        }
      }
      customer_plan = {
                        "status": sub.status,
                        "quantity": sub.quantity,
                        "trial_end": sub.trial_end,
                        "trial_start": sub.trial_start,
                        "nickname": sub.plan.nickname,
                        "amount": sub.plan.amount,
                        "interval": sub.plan.interval,
                        "plan": planName
                      };
      callback(err, [customer_plan])
    } else {
      callback(err, null)
    }
  });
}

export function group_plan(stripeId: string, callback) {
  var plans = [];
  var planName: number;
  var plan;

  stripe.customers.retrieve(stripeId, function(err, customer) {
    if (customer) {
      // console.log('group_plan',customer)
      customer.subscriptions.data.forEach((sub, index) => {
        plan = sub.items.data[0].plan;
        // console.log("sub.items.data",index,sub.items.data)
        console.log("plan",index, plan,"sub.plan",sub.plan)
        if (process.env.PORT) { // PRODUCTION
          switch (plan.product) {
            case "prod_IdFZsOCsSSes7g": planName = 1; break; // Tools PRO
            case "prod_IdFZfzkmnXdgNm": planName = 2; break; // AI PRO
            default: planName = 3;
          }
        } else { // DEVELOPMENT
          // switch (sub.plan.product) {
          switch (plan.product) {
            case "prod_HxhsVnODfiqGaX": planName = 1; break; // Tools PRO
            case "prod_HxhsnVwXmakwxT": planName = 2; break; // AI PRO
            default: planName = 3;
          }
        }
        plans[index] = {
          "status": sub.status,
          "quantity": sub.quantity,
          "trial_end": sub.trial_end,
          "trial_start": sub.trial_start,
          "nickname": plan.nickname,
          "amount": plan.amount,
          "interval": plan.interval,
          "created": plan.created,
          // "nickname": sub.plan.nickname,
          // "amount": sub.plan.amount,
          // "interval": sub.plan.interval,
          // "created": sub.plan.created,
          "plan": planName
        };
      });
      console.log('plans',plans)
      callback(err, plans)
    } else {
      callback(null, null)
    }
  });
}

export function user_billing_period(stripeId: string, callback) {
  stripe.invoices.list(
    { limit: 1, customer: stripeId },
    function(err, invoices) {
      callback(err, invoices.data[0] ? invoices.data[0].period_end : null)
    }
  );
}

export function charges(stripeId: string, callback) {
  var obj = [];
  stripe.charges.list( // stripe.invoices.list(
    { limit: 20, customer: stripeId },
    function(err, charges) {
      if (charges) {
        charges.data.forEach((charge, index) => {
          obj[index]= {
                               "id": charge.id,
                               "paid": charge.paid,
                               // currency
                               "total": charge.amount, //total,
                               "date": charge.created // date
                              };
        });
        callback(err, obj)
      } else {
        callback(err, null)
      }
    }
  );
}

export function payment(stripeId: string, callback) {
  stripe.paymentMethods.list(
    {customer: stripeId, type: 'card'},
    function(err, paymentMethods) {
      // console.log('paymentMethods',stripeId, paymentMethods.data[0])
      // console.log('id',stripeId, paymentMethods.data[0].id)

      if (paymentMethods && paymentMethods.data[0]) {
        const source = paymentMethods.data[0].card;
        const billing_details = paymentMethods.data[0].billing_details;
        const customer_payment = source ?
                           {
                            "brand": source.brand,
                            "last4": source.last4,
                            "name": billing_details.name,
                            "email": billing_details.email,
                            "city": billing_details.address.city,
                            "country": billing_details.address.country,
                            "address": billing_details.address.line1,
                            "state": billing_details.address.state,
                            "zip": billing_details.address.postal_code,
                            // "vat": customer.business_vat_id
                            "vat": null
                           } : null;
        callback(err, customer_payment)
      } else {
        callback()
      }
    }
  );

  // stripe.customers.retrieve(stripeId, function(err, customer) {
  //   console.log('payment',customer)
  //   if (customer) {
  //     source = customer.sources.data[0];
  //     customer_payment = source ?
  //                        {
  //                         "brand": source.brand,
  //                         "last4": source.last4,
  //                         "name": source.name,
  //                         "email": customer.email,
  //                         "city": source.address_city,
  //                         "country": source.address_country,
  //                         "address": source.address_line1,
  //                         "state": source.address_state,
  //                         "zip": source.address_zip,
  //                         "vat": customer.business_vat_id
  //                        } : null;
  //     callback(err, customer_payment)
  //   } else {
  //     callback()
  //   }
  // });
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

export function post_stripe(groupId: string, callback) {
  async.waterfall([

    // 1. get Group Insitute Email
    function (cb) {
      groups.groupMembers(groupId, 5, function (err, admins) {
        cb(err, admins[0].personalInfo.email)
      })
    },

    // 2. validate stripe_id field doesn't exist
    function (email: string, cb) {
      db.groups
        .find( { _id: ObjectID(groupId), stripe_id: { $exists: true } } )
        .project({ _id: 1})
        .next().then(function(item) {
          cb(null, email, (item && item._id) ? true : false)
        })
    },

    // 3. set Stripe
    function (email: string, flag: boolean, cb) {
      console.log('email',email,'flag',flag)
      if (flag) {
        cb()
      } else {
        stripe.customers.create({"email": email}).then(function(customer) {
          console.log('email',email)
          console.log('customer.id',customer.id)
          db.groups.updateOne(
            {_id: ObjectID(groupId)},
            { $set: { "stripe_id": customer.id } },
            function(err, res) {
              cb(err)
            }
          );
        });
      }
    }

  ],
  function (err) {
    if (err) {
      callback(err);
    } else {
      callback(err, null);
    }
  });
};
