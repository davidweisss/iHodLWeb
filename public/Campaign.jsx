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
  created
}}
`;

function WhatCampaign(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return (
    <Container>
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

  var olderThan24h= created > 1
  console.log("created", created)
  console.log("olderThan24h", olderThan24h)

  const dataValue = (raised/goal)*100

  return  (
      <Container>
      <div><br/> <br/>
	<h2>Bitcoin public address: {id}</h2>
	<h1><b>{cause}</b>, <br/> <br/> by <i>{who}</i>,<br/> <br/>  is raising {goal} &#8383;</h1>
	<h3>Has raised {raised} &#8383;</h3> 
      </div>
      <Progress percent={dataValue}/>
	<h3> {dataValue+"%"}</h3> 
	      <h3> {"Created: "+Math.round(10*created)/10+" days ago"}</h3> 
	{!olderThan24h &&
	<h1 style={{color: "Orange"}}>campaign
	  less than 24h old: scanning
	  for old transactions (if any)</h1>
	}
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
