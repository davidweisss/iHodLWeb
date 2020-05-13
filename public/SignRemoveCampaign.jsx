import React from 'react'
import ReactDOM from 'react-dom';
import { Step, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'

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
  const {status} = data.getCampaign
  const message = urlParams.get('message')
  return(
    <Container>
      {message !== null &&
      <Message negative>
	<Message.Header> Error: </Message.Header>
	{message}
      </Message>}
	<h1>Confirm remove campaign</h1>
      {status === "IMPORTED" &&
      <Segment secondary>
	<br/>
	<br/>
	<Form action="RemoveCampaign">
	  <Form.Field as="h2">
	    <label>Signature (sign this message: "challenge")</label>
	    <textarea required name="signature" />
	  </Form.Field>
	  }
	  <Form.Field>
	    <input type="hidden" name="address" value={urlParams.get('address')}/>
	  </Form.Field>
	  <Button size="massive" color="red" type='submit'>
	    <i class="delete icon"></i>
	    Delete</Button>
	</Form>
      </Segment>
      }
      <Header as="h3" style={{color:"Gray"}}>Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}</Header>
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
