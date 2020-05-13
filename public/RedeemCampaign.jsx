import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container, Message, Header, Icon, Segment } from 'semantic-ui-react'

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
`

function RedeemCampaign(gqlQuery)
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
  const picture = urlParams.get('picture')
  console.log(picture)
  console.log(message)
  return(
    <Container>
      {message !== null &&
      <Message negative>
	<Message.Header> Error: </Message.Header>
	{message}
      </Message>}
      <Segment>
	<h1>Enter Transaction  Details</h1>
	<Form id="transaction" action="ComputeRedeemCampaign">
	  <Form.Field as="h2">
	    <label>Destination address</label>
	    <input required name="destAddr" placeholder='Address where camoaign funds will be sent to' />
	  </Form.Field>
	  <Form.Field as="h2">
	    <label>Message</label>
	    <input name="txMessage" placeholder='Message recorded in blockchain with transaction' />
	  </Form.Field>
	  <Form.Field label="Fee" as="h2" name='confirmedInNBlocks' control='select'>
	    <option value='2'>Fast (next block)</option>
	    <option value='6'>Hour</option>
	    <option value='144'>Day</option>
	  </Form.Field>
	  <Form.Field label="Tip" as="h2" name='tipPercent' control='select'>
	    <option value='0.01'>1%</option>
	    <option value='0.05'>5%</option>
	    <option value='0.10'>10%</option>
	    <option value='0'>0%</option>
	  </Form.Field>
	  <Form.Field>
	    <input type="hidden" name="address" value={urlParams.get('address')}/>
	  </Form.Field>
	  <Button primary size="massive" type='submit'>
	    <i class="share square outline icon"></i>
	    Review before signing</Button>
	</Form>
      </Segment>
      <Header as="h3" style={{color:"Gray"}}>Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}</Header>
    </Container>
  )
}

const el = 
  <ApolloProvider client={client}>
    <RedeemCampaign  gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('redeemCampaign')
  );	
