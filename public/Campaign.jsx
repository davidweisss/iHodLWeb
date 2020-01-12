import React from 'react'
import ReactDOM from 'react-dom';
import { Progress, Button, Container } from 'semantic-ui-react'
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';

const link = createHttpLink({ uri: "http://localhost/graphql",
  headers: { 'Content-Type':'application/graphql'},
});
const client = new ApolloClient({
  link:link
});



function getQueryVariable(variable)
{
         var query = window.location.search.substring(1);
         var vars = query.split("&");
         for (var i=0;i<vars.length;i++) {
	                  var pair = vars[i].split("=");
	                  if(pair[0] == variable){return pair[1];}
	          }
         return(false);
}
const WHAT_CAMPAIGN= gql`
query {getCampaign(id:"${getQueryVariable('address')}"){
  id
  who
  goal
  raised
  status
  cause
  ismine
  iswatchonly
  created
}}
`;

function WhatCampaign(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return (
    <Container>
	    <br/> <br/>
      <h2> Reading blockchain and campaign info...</h2>
    </Container>

  )
  if (error){
    return <p>ERROR: {error.message}</p>
  }
  var campaign = data.getCampaign
  const id= campaign.id
  const status= campaign.status
  const goal = campaign.goal
  const raised = campaign.raised 
  const who = campaign.who
  const cause = campaign.cause
  const created = campaign.created
  const ismine = campaign.ismine
  const iswatchonly = campaign.iswatchonly

  var olderThan24h= created > 1
  console.log("created", created)
  console.log("olderThan24h", olderThan24h)

  const percentProgress = Math.round((raised/goal)*10000)/100

  return  (
      <Container>
      <div><br/> <br/>
	      <h1><b>Campaign: {cause}</b> <br/> <br/> By: <i>{who}</i><br/> <br/>  Is raising {goal} &#8383;</h1>
      </div>
      <Progress label={"Raised: "+raised} percent={percentProgress} progress color="blue"/>
	      <h3> {"Created: "+Math.round(10*created)/10+" days ago"}</h3> 
	      {!olderThan24h &&
	      <h1 style={{color: "Orange"}}>campaign
		      less than 24h old: scanning
		      for old transactions (if any)</h1>
	      }
	      {iswatchonly && <h3 style={{color: "Green"}}>Safe non-custodial campaign (only owner has keys to unlock funds, not stored on this website)</h3>}
	      {ismine && <h3 style={{color: "Red"}}>Keys to unlock funds are on this website's server and could be hacked</h3>}
	      <h1 style={{color:"Gray"}} >Bitcoin public address: {id}</h1>
      </Container>
  )
}

const el = 
  <ApolloProvider client={client}>
      <WhatCampaign gqlQuery={WHAT_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('progress')
  );	
