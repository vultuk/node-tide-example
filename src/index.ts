import * as express from 'express';

import { Config } from './config';
import { Tide } from 'node-tide';

const app = express();
let accessToken: string = undefined;

let tide = new Tide();
let oauthUrl = tide.auth.generateAuthUrl({
  clientId: Config.applicationName,
  redirectUrl: Config.callbackUrl
});


app.get('/', (req,res) => {
  res.send(`<a href="${ oauthUrl }">Click Here to Auth!</a>`)
  res.end();
});

app.get('/tide', (req,res) => {
  tide.auth.generateAccessToken(req.query.code)
    .then(authDetails => {
      accessToken = authDetails.accessToken;
      tide.setAccessToken(accessToken);
      return tide.companies.all();
    })
    .then(companies => {
      let companyList = companies.map(item => `<a href="/companies/${item.id}">${item.name}</a>`).join('<br />');
      res.send(`<h1>Choose a Company</h1>${companyList}`);
      res.end();
    })
});

app.get('/companies/:companyId', (req,res) => {
  tide.accounts.all(req.params.companyId)
    .then(accounts => {
      let accountList = accounts.map(item => `<a href="/accounts/${item.id}">${item.name}</a>`).join('<br />');
      res.send(`<h1>Choose an Account</h1>${accountList}`);
      res.end();
    })
});


app.get('/accounts/:accountId', (req,res) => {
  tide.transactions.all(req.params.accountId)
    .then(transactions => {
      let transactionList = transactions.map(item => `${item.transactionOn.format('DD/MM/YYYY')} : ${item.description} - £${item.amount.toFixed(2)}`).join('<br />');
      res.send(`<h1>Here are the transactions</h1>${transactionList}`);
      res.end();
    })
});



app.listen(8099, () => console.log('Example Application running on port 8099!'));
