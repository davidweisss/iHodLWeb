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
}}
`;

function WhatCampaign(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return <p> Loading...</p>;
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
  const dataValue = (raised/goal)*100

  return  (
      <Container>
      <div>
	{status === "PENDINGREVIEW" && <h1>Warning: Pending review</h1>}
	<h2>Fundraising for: {cause}</h2>
	<h2>By: {who}</h2>
	<h3>Goal: {goal}</h3>
	<h3>percent raised: {dataValue}</h3> 
      </div>
      <Progress percent={dataValue}/>
	<h2>Address: {id}</h2>
    </Container>
  )
}

const el = 
  <ApolloProvider client={client}>
      <WhatCampaign gqlQuery={WHAT_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el , document.getElementById('progress')
  );	
