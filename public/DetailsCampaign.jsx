import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container, Message, Header, Icon } from 'semantic-ui-react'

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




var urlParams = new URLSearchParams(window.location.search);

const DETAILS_CAMPAIGN = gql`
query {getCampaign(id:"${urlParams.get('address')}"){
  status
  goal
  who
  cause
}}
`;

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
  const {status, goal, who, cause} = data.getCampaign
  const message = urlParams.get('message')
  console.log(message)
  return(
    <Container>
      {message !== null &&
      <Message negative>
	<Message.Header> Signature validation Error: </Message.Header>
	  {message}
      </Message>}
      <h1>Enter Campaign Details</h1>
      <Form id="details" action="Campaign">
	<Form.Field as="h2">
	  <label>Cause</label>
	  <input name="cause" placeholder='What the funds are for' />
	</Form.Field>
	<Form.Field as="h2">
	  <label>Who</label>
	  <input name="who" placeholder='Anon ok' />
	</Form.Field>
	<Form.Field as="h2">
	  <label>Goal</label>
	  <input pattern="^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$" required name="goal" placeholder='Amount in BTC' />
	</Form.Field>
	{status === "IMPORTED" &&
	<Form.Field as="h2">
	  <label>Signature (sign this message: "challenge")</label>
	  <textarea required name="signature" />
	</Form.Field>
	}
	<Form.Field>
	  <input type="hidden" name="address" value={urlParams.get('address')}/>
	</Form.Field>
	<Button primary size="massive" type='submit'>
	  <i class="save icon"></i>
	Save</Button>
      </Form>

	  <Header as="h3" style={{color:"Gray"}} >Campaign address: <Icon name="bitcoin"/> {urlParams.get('address')}</Header>
    </Container>
)
}
const el = 
  <ApolloProvider client={client}>
    <DetailsCampaign  gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('DetailsCampaign')
  );	
