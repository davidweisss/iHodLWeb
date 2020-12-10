import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom';
import { Menu, Step, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'

import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';

import BitAuth from './BitAuth.jsx'

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
  description
  who
  cause
  picture
  pay2AuthAddress
}}
`

let Navigation = () => 
  <div class="ui rail">
    <div class="ui fixed top sticky">
      <Menu style={{marginTop:'10px'}} size='massive'>
	<Menu.Item as='h1' as='a' href='/'>
	  <Image fluid size='mini' src='bfmLogo.png'/>	
	</Menu.Item>
	<Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='/Search'>
	  Search Campaigns
	</Menu.Item>
	<Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='https://bitfundme.rocks:3000/tutorials/2020/09/03/Getting-started.html'>
	  Tutorial
	</Menu.Item>
      </Menu>
    </div>
  </div>

let MediaDetailsCampaign = (gqlQuery) => {
  
  let prevNextStyle={
    textAlign: 'center',
    margin: '30px 0px 60px 0px '
  }

  const [active, setActive] = urlParams.get('active')? useState(urlParams.get('active')):useState('picture')

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

  let {picture, status, goal, description, who, cause, pay2AuthAddress} = data.getCampaign
  const message = urlParams.get('message')
  console.log(picture)
  if(urlParams.get('picture')){picture = urlParams.get('picture')}
  console.log(picture)

  return(
    <Container>
      <Navigation/>
      <div style={{marginTop: '120px'}}>
	{message !== null &&
	<Message negative>
	  <Message.Header> Error: </Message.Header>
	  {message}
	</Message>}
	<Segment>
	  <h1>Enter Campaign Details</h1>

	  <Step.Group>
	    <Step 
	      active={active === 'picture'}
	      onClick={() => setActive('picture')}
	    >
	      <Icon name='picture' />
	      <Step.Content>
		<Step.Title>Media</Step.Title>
		<Step.Description>Upload a picture</Step.Description>
	      </Step.Content>
	    </Step>
	    <Step 
	      active={active === 'details'}
	      onClick={() => setActive('details')}
	    >
	      <Icon name='info' />
	      <Step.Content>
		<Step.Title>Info</Step.Title>
		<Step.Description>Details and goals</Step.Description>
	      </Step.Content>
	    </Step>
	  </Step.Group>

	    {active === 'picture' &&
	    <div>
	    <Form id="picture" action="MediaCampaign" method="POST" enctype="multipart/form-data">
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

	      </div>
	    }

	    <Form id="details" action='UpdateMediaDetails'>
	      {picture !== null &&
		<Form.Field>
		  <input type="hidden" name="picture" value={picture}/>
		</Form.Field>
	      }
	      {active === 'details' &&
		<div>
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
		  <Form.Field as="h2">
		    <label>Description</label>
		    <TextArea name="description" defaultValue={description || null} placeholder='More details about fundraiser' />
		  </Form.Field>
		</div>
	      }
	      
	      {active === 'picture' &&
		<div style={prevNextStyle}>
		  <Button type='button'
		    onClick={() => setActive('details')}
		  >
		    Next
		  </Button>
		</div>
	      }
	      {active === 'details' &&
		<div style={prevNextStyle}>
		  <Button type='button'
		    onClick={() => setActive('picture')}
		  >
		    Start over
		  </Button>
		</div>
	      }
	      {status === "FIRSTEDIT" &&
		<BitAuth pay2AuthAddress={pay2AuthAddress}/>
	      }
	      <Form.Field>
		<input type="hidden" name="address" value={urlParams.get('address')}/>
	      </Form.Field>
	      <Button primary size="massive" type='submit'>
		<i class="save icon"></i>
		Save</Button>
	    </Form>
	</Segment>
	<Header as="h3" style={{color:"Gray"}}>
	  <a href={'https://bitfundme.rocks/Campaign2?address='+urlParams.get('address')} >
	    Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}
	  </a>
	</Header>
      </div>
    </Container>

  )
}


const el = 
  <ApolloProvider client={client}>
    <MediaDetailsCampaign  gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('MediaDetailsCampaign')
  );	
