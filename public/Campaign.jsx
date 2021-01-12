import React from 'react'
import ReactDOM from 'react-dom';
import { Label, Segment, Comment, Progress, Button, Container, Message, Divider, Icon, Header, Image } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

import NavMenu from './NavMenu.jsx'
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
    url
    goal
    description
    raised
    status
    cause
    picture
    created
    startDate
    endDate
    fundingStatus {
    receivedSinceCreation
    withdrawnSinceCreation
    balanceSinceCreation}
    newsItems {
      created
      message}
    ismine
    iswatchonly
    claimed
  }
}
`
const CurrentTag = ({current})=> {
  if(current){ 
    return <Label color='blue' basic> Active </Label>
  }else{ 
    return <Label color='red' basic> Inactive</Label>
  }
}



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
    url,
    cause,
    picture,
    newsItems,
    created,
    startDate,
    endDate,
    ismine,
    iswatchonly,
    claimed
  } = data.getCampaign

  
  const {receivedSinceCreation, withdrawnSinceCreation, balanceSinceCreation}=fundingStatus
  let current
  if(endDate){ 
    current = Date.now() > parseInt(startDate) && Date.now() < parseInt(endDate) 
  }else{
    current = Date.now() > parseInt(startDate) 
  }

  if (newsItems !== null ){ 
    var cs = newsItems.map(x=>{
      x.created = new Date(parseInt(x.created))
      x.created = x.created.toString().split(" ").slice(1,4).join(" ")
      return x}
    ).map(x =>
      <Comment>
	<Comment.Content>
	  <Comment.Metadata>
	    <Icon name="newspaper"/>
	    <div style={{fontSize: '14px'}}>{
	      x.created
	      }</div>
	  </Comment.Metadata>
	  <Comment.Text style={{margin: '7px 0px 12px 4px', fontSize: '17px'}}>
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
  let olderThan24h= createdSince > 1

  const percentProgress = Math.round((receivedSinceCreation/goal)*10000)/100
  return  (
    <Container>
      <NavMenu/>
      <Container style={{marginTop: '120px'}}>
	<>
	  <Header as='h2'>
	  Campaign Details {claimed && 
	  <Label basic color='blue'>Claimed </Label>
	  }
	 <CurrentTag current={current}/> 
	  </Header>
	  { !claimed &&
	  <Message>
	    Is this campaign yours?
	    <br/>
	    <br/>
	  <Button as='a' href={`SignClaimCampaign?address=${id}`} >Claim Now</Button>
	   </Message>
	  }
	  <Segment style={{borderRadius: '5px', padding: '50px 25px 35px 40px'}}>
	    {/* picture is undefined String when absent!*/}
	    {picture !== "undefined" && <Image centered src={picture} />}
	    <div style={causeStyle} ><ReactMarkdown source={cause}/></div>

	    {/*  cases
      1/ All-time inputs
      2/ Inputs from creation
      3/ Inputs from creation to end date: use10' block estimate
      A/ btc
      B/ usd? => dotprod(withdrawalbtc, btcusd)
      use balanceSinceCreation here?
      */}

	    
	    {!(goal === 0) && 
	      <Progress size="tiny"  percent={percentProgress} color="blue"/>
	    }
	    <p>
	      <span style={causeStyle}>
		{"\u20BF"+receivedSinceCreation}
	      </span> 
	      <span style={smallerStyle}>

		  raised {!(goal === 0) && 
		  `of \u20BF${goal} goal \u00A0` } 

		({"\u20BF" + withdrawnSinceCreation} withdrawn, {"\u20BF"+balanceSinceCreation} balance)</span>
	    </p>

	    {!olderThan24h && <Message negative>Warning: transactions may not appear for up to 24h after campaign is created</Message>}

	    <Button href={`Donate?address=${id}`} primary fluid as="a" size="massive">
	      <i class="bitcoin icon"></i> 
	      Donate Now</Button>
	    <br/>
	    <Button href={`Share?address=${id}&cause=${cause}`} basic color="pink" fluid as="a" size="massive">
	      Share</Button>

	    <Header size="large"><Icon fitted name="user outline"/> Organiser</Header>
	    <div style={{fontSize: '23px'}}>
	      <ReactMarkdown source={who+' '+url}/> is organizing this fundraiser </div>
	    {description !== null  && 
	    <>
	      <br/>
	      <Header size="large"><Icon fitted name="info circle"/> More info
	      </Header> 
	      <Container style={{fontSize: '23px'}} ><ReactMarkdown  source={description}/></Container> 
	      <br/>
	      <Divider/>
	    </>
	    }


	    {newsItems !== null  && 
	      <>
		<Header size="large"><Icon name="newspaper outline"/>News 
		</Header>
		<div >
		  {cs}
		  <br/>
		</div>
	      </>
	    }

	    <Button href={`NewsItem?address=${id}`} as="a" size="big">
	      <i class="newspaper outline icon"></i> 
	      Post update</Button>
	    <Divider/>
	    <h3> {"Created: "+Math.round(10*createdSince)/10+" days ago"}</h3> 
	    <div>
	      <Button href={`MediaDetailsCampaign?address=${id}`} as="a" size="big">
		<i class="edit icon"></i> 
		Edit</Button>
	      <Button href={`SignRemoveCampaign?address=${id}`} as="a" size="big">
		<i class="delete icon"></i> 
		Delete</Button>
	    </div>
	    {iswatchonly && <Message positive>Safe non-custodial campaign (only owner has keys to unlock funds, not stored on this website)</Message>}
	    {ismine && <Message warning>Keys to unlock funds are on this website's server and could be hacked</Message>}
	  </Segment>
	<Header size="small" style={{color:"Gray"}} >Campaign address <Icon fitted color="orange" name="bitcoin"/>{id}</Header>

	</>
      </Container>
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
