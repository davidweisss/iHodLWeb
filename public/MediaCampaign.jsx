import React from 'react'
import ReactDOM from 'react-dom';
import { Step, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea, Menu } from 'semantic-ui-react'

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
  picture
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
  let {picture, status} = data.getCampaign
  const message = urlParams.get('message')
  console.log(picture)
  const setOrUpdate= status === "NEW" ? "SetMedia": "UpdateMedia"

  if(urlParams.get('picture') !== null){  picture = urlParams.get('picture')}

  console.log(urlParams.get('picture'))
  console.log(picture)
  return(
    <Container>
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
    <div style={{marginTop: '120px'}}>
      {message !== null &&
      <Message negative>
	<Message.Header> Error: </Message.Header>
	{message}
      </Message>}
      <Segment>
	<h1>Enter Campaign Details</h1>

	<Step.Group>
	  <Step as='a' href={'MediaCampaign?address='+urlParams.get('address')} active>
	    <Icon name='picture' />
	    <Step.Content>
	      <Step.Title>Media</Step.Title>
	      <Step.Description>Upload a picture</Step.Description>
	    </Step.Content>
	  </Step>

	  <Step as='a' href={'DetailsCampaign?address='+urlParams.get('address')} >
	    <Icon name='info' />
	    <Step.Content>
	      <Step.Title>Info</Step.Title>
	      <Step.Description>Details and goals</Step.Description>
	    </Step.Content>
	  </Step>
	</Step.Group>

	{/* Upload picture */}
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

	{/* Enter details */}
	<Form id="details" action={setOrUpdate}>
	  {/* Submit pictures with other details*/}
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
      <Header as="h3" style={{color:"Gray"}}>Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}</Header>
    </div>
    </Container>

  )
}
const el = 
  <ApolloProvider client={client}>
    <DetailsCampaign  gqlQuery={DETAILS_CAMPAIGN}/>
  </ApolloProvider>

  ReactDOM.render(
    el, document.getElementById('MediaCampaign')
  );	
