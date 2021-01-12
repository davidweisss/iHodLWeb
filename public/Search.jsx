import React from 'react'
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { Menu, Form, Button, Container, Grid, Image, Header, Icon, Progress } from 'semantic-ui-react'
import NavMenu from './NavMenu.jsx'
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

var searchTerm = urlParams.get('searchTerm') 


const ALL_CAMPAIGNS= gql` 
query {getAllCampaigns{ 
  id 
  who
  goal
  cause
  created
  startDate
  endDate
  claimed
  picture
}}
`;

const WHAT_CAMPAIGNS= gql`
query {getCampaigns(searchTerm:"${searchTerm}"){
  id
  who
  goal
  cause
  created
  startDate
  endDate
  claimed
  picture
}}
`;

const Loading = () => 
  <Container style={{textAlign: "center"}}>
    <br/> <br/>
    <Header as="h1"  icon> <Icon loading color="orange" name="bitcoin"/>  Getting campaigns...
    </Header>
  </Container>

    
const CampaignsGrid = (props) =>
{
  let paddingInner= {
    backgroundColor: 'black',
    borderRadius: '10px',
    paddingTop: '35px',
    paddingBottom: '45px',
    paddingLeft: '25px',
    paddingRight: '35px'
  }
  let padding = {
    paddingTop: '20px',
    paddingBottom: '20px',
    paddingLeft: '20px',
    paddingRight: '20px'
  }
  let headerStyle = {color: 'white'}
  var cs =  props.d.map(x =>
    <Grid.Column style={padding}  as="a" href={"https://bitfundme.rocks/Campaign?address="+x.id}>
      <div style={paddingInner}>
	<Header style={headerStyle} as="h3"> <ReactMarkdown source={x.who}/> </Header>
	<Header style={headerStyle} as="h2"> <ReactMarkdown source={x.cause}/> </Header>
	{x.picture !== null ? 
	  <Image centered bordered style={{borderRadius: '5px'}} src={x.picture} />
	  : 
	  <QRCode value={x.id} size="100"/>}
      </div>
    </Grid.Column>
  )
  return  (
    <Grid doubling columns={4}>
      {cs}
    </Grid>
  )
}

let isCurrent = (c) => {
  let current
  if(c.endDate){ 
    current = Date.now() > parseInt(c.startDate) && Date.now() < parseInt(c.endDate) 
  }else{
    current = Date.now() > parseInt(c.startDate) 
  }
  if(current){return 1}else{return 0}
}

function LatestCampaigns(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return <Loading/>

  if (error){
    return <p>ERROR: {error.message}</p>
  }

  var d = data.getAllCampaigns

  d = d.sort((a,b) => b.startDate- a.startDate)
  d = d.sort((a,b) => isCurrent(b)- isCurrent(a))
  d = d.sort((a,b) => (b.claimed?1:0)- (a.claimed?1:0))
  
  return (<CampaignsGrid d={d} cols={4}/>)
}

function SearchCampaigns(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return <Loading/>
  if (error){
    return <p>ERROR: {error.message}</p>
  }

  var d = data.getCampaigns
  return (<CampaignsGrid d={d} cols={4}/>)
}
let SearchHeader = (props) => <Header style={{
  color: 'teal', 
  fontSize: '2.5rem',
  marginBottom: '35px'
  }} as="h1">
  {props.title}
  </Header>

  const el = 
    <Container>
      <NavMenu active="search"/>
      <Container style={{marginTop:'120px'}}>
	<Header as="h2">Search Campaign</Header>
	<Form action="Search">
	  <Form.Field as="h2">
	    <input name="searchTerm" type="text"/> <br/>
	  </Form.Field>
	  <Button style={{backgroundColor: 'orange'}} primary size="massive" type='submit'>Search</Button>
	</Form>
      </Container>
      <ApolloProvider client={client}>
	<br/>
	<br/>
	{searchTerm && 
	<div>
	  <SearchHeader  title={'Search results for:' + searchTerm}/>
	  <SearchCampaigns gqlQuery={WHAT_CAMPAIGNS}/>
	</div>
	}
	<br/>
	<br/>

	<SearchHeader  title={'Latest Campaigns (active and claimed campaigns appear first)'}/>
	<LatestCampaigns gqlQuery={ALL_CAMPAIGNS}/>
      </ApolloProvider>
    </Container>

  ReactDOM.render(
    el, document.getElementById('Search')
  );
