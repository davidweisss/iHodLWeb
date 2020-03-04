import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container, Message, Header, Icon, Image, Segment } from 'semantic-ui-react'

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
	<h1>Enter Campaign Details</h1>
	<Form id="picture" action="Campaign" method="POST" enctype="multipart/form-data">
	  <Form.Field as="h2">
	    <label>Picture</label>
	    <input type="file" name="picture"  accept="image/*"/>
	  </Form.Field>
	  <Form.Field>
	    <input type="hidden" name="address" value={urlParams.get('address')}/>
	  </Form.Field>
	  <Button size="big" type='submit'>
	    <i class="upload icon"></i>
	    Upload</Button>
	</Form>
	<br/>
	{picture !== null && <Image src={picture}/>}
	<Form id="details" action="Campaign">
	  <Form.Field as="h2">
	    <label>Cause</label>
	    <input name="cause" defaultValue={cause || null} placeholder='What the funds are for' />
	  </Form.Field>
	  <Form.Field as="h2">
	    <label>Who</label>
	    <input name="who" defaultValue={who || null} placeholder='Anon ok' />
	  </Form.Field>
	  <Form.Field as="h2">
	    <label>Goal</label>
	    <input pattern="^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$" required name="goal" defaultValue={goal || null} placeholder='Amount in BTC' />
	  </Form.Field>
	  {picture !== null &&
	  <Form.Field>
	    <input type="hidden" name="picture" value={picture}/>
	  </Form.Field>}
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
      </Segment>
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
    el, document.getElementById('DetailsCampaign')
  );	
