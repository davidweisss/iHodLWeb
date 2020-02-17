import React from 'react'
import ReactDOM from 'react-dom';
import { Progress, Button, Container, Message, Divider, Icon, Header, Image } from 'semantic-ui-react'
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
  picture
  ismine
  iswatchonly
  created
}}
`;

function WhatCampaign(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
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
  var campaign = data.getCampaign
  const id= campaign.id
  const status= campaign.status
  const goal = campaign.goal
  const raised = campaign.raised 
  const who = campaign.who
  const cause = campaign.cause
  const picture = campaign.picture
  const created = campaign.created
  const ismine = campaign.ismine
  const iswatchonly = campaign.iswatchonly

  var createdSince = (Date.now()-created)/(1000*3600*24)
  var olderThan24h= createdSince > 1

  const percentProgress = Math.round((raised/goal)*10000)/100
  const causeStyle= {
    fontSize: '3em', 
    fontWeight: 'bold', 
    marginTop: '0.67em',
    marginBottom: '0.67em'}

  const smallerStyle= {
    fontSize: '2em', 
    marginTop: '0.67em',
    marginBottom: '0.67em'}
  return  (
    <Container>
      {picture !== null && <Image src={picture} />}
      <div style={causeStyle} >{cause}</div>
      <Progress size="tiny"  percent={percentProgress} color="blue"/>
      <p><span style={causeStyle}>&#8383;{raised}</span> <span style={smallerStyle}>raised of &#8383;{goal} goal</span></p>
      <Button href={`Donate?address=${id}`} primary fluid as="a" size="massive">
	<i class="bitcoin icon"></i> 
	Donate Now</Button>
      <Header size="large"><Icon name="user"/> <i>{who}</i> is organizing this fundraiser</Header>
      <Divider/>
      <h3> {"Created: "+Math.round(10*createdSince)/10+" days ago"}</h3> 
      {id.charAt(0)==1 && 
      <Button href={`DetailsCampaign?address=${id}&goal=${goal}&cause=${cause}&who=${who}`} as="a" size="big">
	<i class="edit icon"></i> 
	Edit</Button>
      }
      {!olderThan24h &&
	<Message warning>
	  <Icon loading name="bitcoin"/> Campaign
	  less than 24h old: scanning
	  for old transactions (if any)</Message>
      }
      {iswatchonly && <Message positive>Safe non-custodial campaign (only owner has keys to unlock funds, not stored on this website)</Message>}
      {ismine && <Message warning>Keys to unlock funds are on this website's server and could be hacked</Message>}
      <Header size="small" style={{color:"Gray"}} >Campaign address <Icon fitted color="orange" name="bitcoin"/>{id}</Header>
    </Container>
  )
}

const el = 
  <ApolloProvider client={client}>
      <WhatCampaign gqlQuery={WHAT_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('progress')
  );	
