import React from 'react'
import ReactDOM from 'react-dom';
import { Menu, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'
import NavMenu from './NavMenu.jsx'

import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';

import BitAuth from './BitAuth.jsx'

const link = createHttpLink({ uri: "http://localhost/graphql",
  headers: { 'Content-Type':'application/graphql'},
});
const client = new ApolloClient({
  link:link
});

var urlParams = new URLSearchParams(window.location.search);

const DETAILS_CAMPAIGN = gql`
query {getCampaign(id:"${urlParams.get('address')}"){
  pay2AuthAddress
}}
`

function DetailsCampaign(gqlQuery)
{
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return (
    <Container>
      <br/> <br/>
      <h2> Checking campaign status...</h2>
    </Container>
  )
  if (error){
    return <p>ERROR: {error.message}</p>
  }
  const {pay2AuthAddress} = data.getCampaign
  const message = urlParams.get('message')
  let address = urlParams.get('address')
  console.log('in jsx.', message, pay2AuthAddress, address)
  return(
    <Container>
      <NavMenu active='Campaign'/>
      <div style={{marginTop: '120px'}}>
	{message !== null &&
	<Message negative>
	  <Message.Header> Error: </Message.Header>
	  {message}
	</Message>}
	<h1>Claim Campaign</h1>
	<Form id="claim" action='ClaimCampaign'>
	  <BitAuth pay2AuthAddress={pay2AuthAddress}/>

	  <Form.Field>
		<input type="hidden" name="address" value={address}/>
	      </Form.Field>
	  <Button primary size="massive" type='submit'>
	    <i class="paw icon"></i>
	    Claim</Button>
	</Form>
      </div>
      <Header as="h3" style={{color:"Gray"}}>
	<a href={'https://bitfundme.rocks/Campaign?address='+urlParams.get('address')} >
	  Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}
	</a>
      </Header>
    </Container>

  )
}
const el = 
  <ApolloProvider client={client}>
    <DetailsCampaign  gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>

ReactDOM.render(
    el, document.getElementById('SignClaimCampaign'));	
