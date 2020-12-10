import React from 'react'
import ReactDOM from 'react-dom';
import { Comment, Progress, Button, Container, Message, Divider, Icon, Header, Image } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

// graphql
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';

const link = createHttpLink({ uri: "http://localhost/graphql"});
const client = new ApolloClient({
  link:link
});

var urlParams = new URLSearchParams(window.location.search);
const WHAT_CAMPAIGN= gql`
query {
  getCampaign(id:"${urlParams.get('address')}"){
    id
    who
    goal
    description
    raised
    status
    cause
    picture
    created
    fundingStatus {
    receivedSinceCreation
    withdrawnSinceCreation
    balanceSinceCreation}
    newsItems {
      created
      message}
    ismine
    iswatchonly
  }
}
`


function WhatCampaign(gqlQuery) {
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
    ismine,
    iswatchonly
  } = data.getCampaign

  const {receivedSinceCreation, withdrawnSinceCreation, balanceSinceCreation}=fundingStatus

  if (newsItems !== null ){ 
    var cs = newsItems.map(x=>{
      x.created = new Date(parseInt(x.created))
      x.created = x.created.toString().split(" ").slice(1,5).join(" ")
      return x}
    ).map(x =>
      <Comment>
	<Comment.Content>
	  <Comment.Metadata>
	    <Icon name="newspaper"/>
	    <div>{
	      x.created
	      }</div>
	  </Comment.Metadata>
	  <Comment.Text>
	    <ReactMarkdown source={x.message}/>
	  </Comment.Text>
	</Comment.Content>
      </Comment>
    )
  // latest posts first
  cs=cs.reverse()
  }
  const causeStyle= {
    fontSize: '3em', 
    fontWeight: 'bold', 
    marginTop: '0.67em',
    marginBottom: '0.67em',
    lineHeight: 1.4 
  }

  const smallerStyle= {
    fontSize: '2em', 
    marginTop: '0.67em',
    marginBottom: '0.67em'}

  // 
  let createdSince = (Date.now()-created)/(1000*3600*24)
  console.log("createdSince",createdSince)
  let olderThan24h= createdSince > 1

  const percentProgress = Math.round((receivedSinceCreation/goal)*10000)/100
  return  (
    <Container>
      {/* picture is undefined String when absent!*/}
      {picture !== "undefined" && <Image centered src={picture} />}
      <div style={causeStyle} >{cause}</div>

      {/*  cases
      1/ All-time inputs
      2/ Inputs from creation
      3/ Inputs from creation to end date: use10' block estimate
      A/ btc
      B/ usd? => dotprod(withdrawalbtc, btcusd)
      use balanceSinceCreation here?
      */}

      <Progress size="tiny"  percent={percentProgress} color="blue"/>
      <p><span style={causeStyle}>&#8383;{receivedSinceCreation}</span> <span style={smallerStyle}>raised of &#8383;{goal} goal (&#8383;{withdrawnSinceCreation} withdrawn, &#8383;{balanceSinceCreation} balance)</span></p>
      
      {!olderThan24h && <Message negative>Warning: transactions may not appear for up to 24h after campaign is created</Message>}

      <Button href={`Donate?address=${id}`} primary fluid as="a" size="massive">
	<i class="bitcoin icon"></i> 
	Donate Now</Button>
      <br/>
      <Button href={`Share?address=${id}&cause=${cause}`} basic color="pink" fluid as="a" size="massive">
	Share</Button>

      <Header size="large"><Icon fitted name="user"/> Organiser</Header>
      <i>{who}</i> is organizing this fundraiser

      {description !== null  && 
      <div>
	<br/>
	<Header size="large"><Icon fitted name="info"/> More info
	</Header> 
	<Container text><ReactMarkdown source={description}/></Container>
	      </div>
      }


      {newsItems !== null  && 
	<div>
	<Divider/>
	  <br/>
	  {cs}
	  <br/>
	</div>
      }

      {id.charAt(0)==1 && 
      <Button href={`NewsItem?address=${id}`} as="a" size="big">
	<i class="newspaper icon"></i> 
	Post update</Button>
      }
      <Divider/>
      <h3> {"Created: "+Math.round(10*createdSince)/10+" days ago"}</h3> 
      {id.charAt(0)==1 && 
      <div>
	<Button href={`MediaDetailsCampaign?address=${id}`} as="a" size="big">
	  <i class="edit icon"></i> 
	  Edit</Button>
	<Button href={`SignRemoveCampaign?address=${id}`} as="a" size="big">
	  <i class="delete icon"></i> 
	  Delete</Button>
      </div>
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
