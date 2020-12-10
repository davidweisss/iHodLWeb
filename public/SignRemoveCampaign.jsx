import React from 'react'
import ReactDOM from 'react-dom';
import { Menu, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'

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
  status
  pay2AuthAddress
}}
`
let Navigation = () => 
  <div class="ui rail">
    <div class="ui fixed top sticky">
      <Menu style={{marginTop:'10px'}} size='massive'>
	<Menu.Item as='h1' as='a' href='/'>
	  <Image fluid size='mini' src='bfmLogo.png'/>	
	</Menu.Item>
	<Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='/Search'>
	  Search Campaigns
	</Menu.Item>
	<Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='https://bitfundme.rocks:3000/tutorials/2020/09/03/Getting-started.html'>
	  Tutorial
	</Menu.Item>
      </Menu>
    </div>
  </div>
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
  const {status, pay2AuthAddress} = data.getCampaign
  const message = urlParams.get('message')
  return(
    <Container>
      <Navigation/>
      <div style={{marginTop: '120px'}}>
	{message !== null &&
	<Message negative>
	  <Message.Header> Error: </Message.Header>
	  {message}
	</Message>}
	<h1>Confirm remove campaign</h1>
	<Form id="remove " action='RemoveCampaign'>
	  <BitAuth pay2AuthAddress={pay2AuthAddress}/>

	  <Form.Field>
		<input type="hidden" name="address" value={urlParams.get('address')}/>
	      </Form.Field>
	  <Button primary negative size="massive" type='submit'>
	    <i class="delete icon"></i>
	    Delete</Button>
	</Form>
      </div>
      <Header as="h3" style={{color:"Gray"}}>
	<a href={'https://bitfundme.rocks/Campaign2?address='+urlParams.get('address')} >
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
    el, document.getElementById('SignRemoveCampaign')
  );	
