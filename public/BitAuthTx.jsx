import React, {useState} from 'react'
import ReactDOM from 'react-dom';
//import { Form, Input, Menu, Segment, Header} from 'semantic-ui-react'

//////////////////////////
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';

const link = createHttpLink({ uri: "http://localhost/graphql"});
const client = new ApolloClient({
  link:link
});

var urlParams = new URLSearchParams(window.location.search);
let tip= 0.00000001
let confirmedInNBlocks = 100
let txMessage = "https://bitfundme.rocks"

const TXPARAMS = gql`
query {
  getPay2AuthTx(
    id:"${urlParams.get('address')}",
    tip: ${tip}.
    confirmedInNBlocks: ${confirmedInNBlocks},
    txMessage: ${txMessage}
  ){
    pay2AuthTx
  }
}
`

function GetTx(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);

  // Loadind and error hamdling
  if (loading) return (
    <Container style={{textAlign: "center"}}>
      <br/> <br/>
      <Header as="h1"  icon> <Icon loading color="orange" name="bitcoin"/> Reading blockchain and campaign info...
      </Header>
    </Container>

  )
  if (error){
    return <p>ERROR: {error.message}</p>
  }

  const { 
    id,
    status,
    goal,
    description,
    raised,
    fundingStatus,
    who,
    cause,
    picture,
    newsItems,
    created,
    startDate,
    endDate,
    ismine,
    iswatchonly,
    claimed
  } = data.getCampaign

}
const BitAuthTx = 
  <ApolloProvider client={client}>
    <WhatCampaign gqlQuery={WHAT_CAMPAIGN}/>
  </ApolloProvider>

  export default BitAuthTx

