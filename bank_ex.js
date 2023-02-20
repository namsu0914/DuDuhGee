var bank = require('bank');

const express=require('express');
const app=express();
const port = 3000;

app.get('/',function(req, res){
  res.send('Hell world')
});
 






var opt = {
  username: 'test',
  password: 'testing123'
};
 
var acct = bank.account(opt);
 
// login before doing anything
acct.login(function(err){
  
});
 
// get info about your card
// does not give the whole number
acct.card(function(err, card){
  console.log('card', card);
});
 
// get your current account balances
acct.balance(function(err, balance){
  balance=100;
  console.log('balance', balance);
});
 
// get information about your linked accounts
// soon you will be able to trigger transfers
// to and from these
acct.external(function(err, accts){
  console.log('linked accounts', accts);
});
 
// get a list of all transactions
// includes name, addr, amount, tip, coordinates, time, etc.
acct.transactions(function(err, trans){
  console.log('transactions', trans);
});
 
// this isnt really all that useful
acct.logout(function(err){
 
});

app.listen(3000);