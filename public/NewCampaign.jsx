import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container, Grid, Image, Header, Icon, Progress } from 'semantic-ui-react'
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';
import QRCode from 'qrcode.react'

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

const link = createHttpLink({ uri: "http://localhost/graphql",
  headers: { 'Content-Type':'application/graphql'},
});
const client = new ApolloClient({
  link:link
});

var searchTerm = getQueryVariable('searchTerm') || "bitcoin"

const WHAT_CAMPAIGNS= gql`
query {getCampaigns(searchTerm:"${searchTerm}"){
  id
  who
  goal
  cause
  created
  picture
  raised
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
    <Grid.Column as="a" href={"https://bitfundme.rocks/Campaign?address="+x.id}>
      <Header as="h2"> {x.cause} </Header>
      <Header as="h3"> {x.who} </Header>
      {x.picture !== null ? 
	<Image src={x.picture} />
	: 
	<QRCode value={x.id} size="100"/>}
      <Progress size="medium" percent={Math.round((x.raised/x.goal)*10000)/100} color="blue"/>
      Raised &#8383;{x.raised}
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
    <br/>
    <br/>
    <Container>
      <h1>Search Campaign or Create New Campaign</h1>
      <Form action="Campaign">
	<Form.Field as="h2">
	  <label>Enter valid Bitcoin address, or query</label>
	  <input name="address" type="text"/> <br/><br/>
	</Form.Field>
	<Button primary size="massive" type='submit'>Submit</Button>
      </Form>
    </Container>
    <ApolloProvider client={client}>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <WhatCampaigns gqlQuery={WHAT_CAMPAIGNS}/>
    </ApolloProvider>
  </Container>

  ReactDOM.render(
    el, document.getElementById('NewCampaign')
  );	
