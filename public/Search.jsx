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

var searchTerm = urlParams.get('searchTerm') 


const ALL_CAMPAIGNS= gql` 
query {getAllCampaigns{ 
  id 
  who
  goal
  cause
  created
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
    <Grid.Column style={padding}  as="a" href={"https://bitfundme.rocks/Campaign2?address="+x.id}>
      <div style={paddingInner}>
	<Header style={headerStyle} as="h3"> {x.who} </Header>
	<Header style={headerStyle} as="h2"> {x.cause} </Header>
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

function LatestCampaigns(gqlQuery) {
  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  if (loading) return <Loading/>

  if (error){
    return <p>ERROR: {error.message}</p>
  }

  var d = data.getAllCampaigns
  d = d.sort((a,b) => b.created - a.created)
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
	<div class="ui rail">
	  <div class="ui fixed top sticky">
      <Menu style={{marginTop:'10px'}} size='massive'>
	    <Menu.Item as='h1' as='a' href='/'>
	      <Image fluid size='mini' src='bfmLogo.png'/>	
	    </Menu.Item>
	<Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='/NewAddress'>
	      Create New Campaign
	    </Menu.Item>
	  </Menu>
	</div>
      </div>
	  <br/>
	  <br/>
	  <Container style={{marginTop:'80px'}}>
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

	    <SearchHeader  title={'Latest Campaigns'}/>
	    <LatestCampaigns gqlQuery={ALL_CAMPAIGNS}/>
	</ApolloProvider>
    </Container>

  ReactDOM.render(
    el, document.getElementById('Search')
  );
