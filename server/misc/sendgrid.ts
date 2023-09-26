const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_API_KEY);

exports.statsEmail = function (email: string, callback) {
  const queryParams = {
    'limit': 10,
    // 'query': 'to_email="huying3916@163.com"'
    'query': 'to_email="' + email + '"'
  };

  const request = {
    method: 'GET',
    url: '/v3/messages',
    qs: queryParams
  };

  client.request(request)
  .then(([response, body]) => {
    // console.log(response.statusCode);
    // console.log(response.body);
    callback(null, response.body.messages)
  }).catch((error) => {
    // console.log('error', error.response.body.errors[0]);
    console.log('error', error);
    callback()
  });
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

exports.getGroupSuppressions = function (group_id: string, callback) {
  const request = {
    method: "GET",
    url: "/v3/asm/groups/"+group_id+"/suppressions",
    body: { }
  };

  client.request(request)
  .then(([response, body]) => {
    // console.log('response',response.body)
    // console.log('body',body)
    callback(null, response.body)
  })
  // .catch((error) => {
  //   // console.log('error', error.response.body.errors[0]);
  //   console.log('error', error);
  //   // callback()
  // });
}

exports.getContactSuppressions = function (email: string, callback) {
  const request = {
    method: "GET",
    url: "/v3/asm/suppressions/" + email,
    body: { }
  };

  client.request(request)
  .then(([response, body]) => {
    // console.log('response',response)
    callback(null, response.body.suppressions)
  })
  // .catch((error) => {
  //   // console.log('error', error.response.body.errors[0]);
  //   console.log('error', error);
  //   // callback()
  // });
}

exports.postSuppressions = function (groupId: string, emails: string[], callback) {
  const request = {
    method: 'POST',
    url: '/v3/asm/groups/'+groupId+'/suppressions',
    body: { "recipient_emails": emails }
  };

  client.request(request)
  .then(([response, body]) => {
    callback(null, body)
  }).catch((error) => {
    console.log('error', error);
    callback()
  });
}

exports.deleteSuppressions = function (groupId: string, email: string, callback) {
  const request = {
    method: 'DELETE',
    url: '/v3/asm/groups/'+groupId+'/suppressions/' + email,
  };

  client.request(request)
  .then(([response, body]) => {
    callback(null, body)
  }).catch((error) => {
    console.log('error', error);
    callback()
  });
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

exports.contactAdd = function (email: string, first_name: string, last_name: string, listIds: number[], callback) {
  // "name": "Academig Launchpad", "id": "7ea336f1-a6ed-4f68-8e88-6781860eb2a3",
  // "name": "Academig Daily", "id": "bd1140a6-1979-49bb-8900-bd7c0e514339",
  // "name": "Academig Morning", "id": "e44dd63f-875e-4ca2-8a08-e18426666352",

  const request = {
    method: 'PUT',
    url: '/v3/marketing/contacts',
    body: {
      "list_ids": ['7ea336f1-a6ed-4f68-8e88-6781860eb2a3','bd1140a6-1979-49bb-8900-bd7c0e514339','e44dd63f-875e-4ca2-8a08-e18426666352'],
      "contacts": [
        {
          "email": email,
          "first_name": first_name,
          "last_name": last_name
        }
      ]
     }
  };
  //    contacts:
  //     [ { address_line_1: 'string (optional)',
  //         address_line_2: 'string (optional)',
  //         alternate_emails: [ 'string' ],
  //         city: 'string (optional)',
  //         country: 'string (optional)',
  //         email: 'string (required)',
  //         first_name: 'string (optional)',
  //         last_name: 'string (optional)',
  //         postal_code: 'string (optional)',
  //         state_province_region: 'string (optional)',
  //         custom_fields: {} } ] },

  client.request(request)
  .then(([response, body]) => {
    callback(null, body)
  }).catch((error) => {
    console.log('error', error);
    callback()
  });
}

exports.contactUpdateName = function (email: string, first_name: string, last_name: string, callback) {
  const request = {
    method: 'PUT',
    url: '/v3/marketing/contacts',
    body: {
      "contacts": [
        {
          "email": email,
          "first_name": first_name,
          "last_name": last_name
        }
      ]
     }
  };

  client.request(request)
  .then(([response, body]) => {
    callback(null, body)
  }).catch((error) => {
    console.log('error', error);
    callback()
  });
}

exports.contactDelete = function (email: string, callback) {
  const requestSearch = {
    method: 'POST',
    url: '/v3/marketing/contacts/search',
    body: { query: 'email LIKE \'rony@academig.com%\'' },
    json: true
  };

  client.request(requestSearch).then(([response, body]) => {
    console.log('body.result.id',body.result[0].id)
    const request = {
      method: 'DELETE',
      url: '/v3/marketing/contacts',
      qs: { ids: body.result[0].id },
      body: '{}'
    };
    client.request(request).then(([response, body]) => {
      callback()
    }).catch((error) => {
      console.log('errorContactDelete', error);
      callback()
    });
  }).catch((error) => {
    console.log('errorContactSearch', error);
    callback()
  });
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

exports.postCampaign = function (callback) {
  const request = {
    method: 'GET',
    url: '/v3/senders'
    // body: { }
  };

  client.request(request)
  .then(([response, body]) => {
    console.log('body',body)
    callback(null, response.body)
  }).catch((error) => {
    console.log('error', error.response.body.errors[0]);
    callback()
  });
  //
  // const request = {
  //   method: 'POST',
  //   url: '/v3/campaigns',
  //   body: {
  //     "title": "March Newsletter",
  //     "subject": "New Products for Spring!",
  //     // "sender_id": 124451,
  //     // "list_ids": [
  //     //   110,
  //     //   124
  //     // ],
  //     // "segment_ids": [
  //     //   110
  //     // ],
  //     // "categories": [
  //     //   "spring line"
  //     // ],
  //     // "suppression_group_id": 8842,
  //     // "custom_unsubscribe_url": "",
  //     // "ip_pool": "marketing",
  //     "html_content": "<html><head><title></title></head><body><p>Check out our spring line!</p></body></html>",
  //     "plain_content": "Check out our spring line!"
  //   }
  // };
  //
  // client.request(request)
  // .then(([response, body]) => {
  //   callback(null, body)
  // }).catch((error) => {
  //   console.log('error', error.response.body);
  //   console.log('error', error);
  //   callback()
  // });
}
