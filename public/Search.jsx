import React from 'react'
import ReactDOM from 'react-dom';
import { Menu, Form, Button, Container, Grid, Image, Header, Icon, Progress } from 'semantic-ui-react'
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';
import QRCode from 'qrcode.react'

var urlParams = new URLSearchParams(window.location.search);

const link = createHttpLink({ uri: "http://localhost/graphql",
  headers: { 'Content-Type':'application/graphql'},
});
const client = new ApolloClient({
  link:link
});

var searchTerm = urlParams.get('searchTerm') || "bitcoin"

const WHAT_CAMPAIGNS= gql`
query {getCampaigns(searchTerm:"${searchTerm}"){
  id
  who
  goal
  cause
  created
  picture
}}
`;

function WhatCampaigns(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return (
    <Container style={{textAlign: "center"}}>
	    <br/> <br/>
      <Header as="h1"  icon> <Icon loading color="orange" name="bitcoin"/>  Getting campaigns...
      </Header>
    </Container>
  )

  if (error){
    return <p>ERROR: {error.message}</p>
  }
  //var createdSince = (Date.now()-created)/(1000*3600*24)
  var d = data.getCampaigns

  var cs =  d.map(x =>
    <Grid.Column as="a" href={"https://bitfundme.rocks/Campaign2?address="+x.id}>
      <Header as="h2"> {x.cause} </Header>
      <Header as="h3"> {x.who} </Header>
      {x.picture !== null ? 
	<Image src={x.picture} />
	: 
	<QRCode value={x.id} size="100"/>}
    </Grid.Column>
  )

  return  (
    <Container>
      <Header as="h2"> Search results for: {searchTerm}
      </Header>
      <Grid celled container columns={2}>
	{cs}
      </Grid>
    </Container>
  )
}
const el = 
  <Container>

    <Menu>
      <Menu.Item as='h1' as='a' href='/'>
	Home
      </Menu.Item>
      <Menu.Item as='h1' as='a' href='/NewAddress'>
	Create New Campaign
      </Menu.Item>
    </Menu>
    <br/>
    <br/>
    <Container>
      <h1>Search Campaign</h1>
      <Form action="Search">
	<Form.Field as="h2">
	  <input name="searchTerm" type="text"/> <br/><br/>
	</Form.Field>
	<Button primary size="massive" type='submit'>Submit</Button>
      </Form>
    </Container>
    <ApolloProvider client={client}>
      <br/>
      <br/>
      <br/>
      <br/>
      <WhatCampaigns gqlQuery={WHAT_CAMPAIGNS}/>
    </ApolloProvider>
  </Container>

  ReactDOM.render(
    el, document.getElementById('Search')
  );	
