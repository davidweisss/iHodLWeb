import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom';
import { Checkbox, Menu, Step, Form, Button, Container, Message, Image, Header, Icon, Segment, TextArea } from 'semantic-ui-react'

import NavMenu from './NavMenu.jsx'

import DatePicker from "react-datepicker"
import "./react-datepicker.css"

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
  startDate
  endDate
  description
  who
  url
  cause
  picture
  pay2AuthAddress
}}
`

let MediaDetailsCampaign = (gqlQuery) => {

  let prevNextStyle={
    textAlign: 'center',
    margin: '30px 0px 60px 0px '
  }

  const [active, setActive] = urlParams.get('active')? useState(urlParams.get('active')):useState('picture')


  const [openEnded, setOpenEnded] = useState('false');
  const [startDate, setStartDate] = useState(Date.now());
  const [endDate, setEndDate] = useState((new Date( Date.now() + (6.048e+8 ) )).getTime());

  const { data, loading, error } = useQuery(gqlQuery.gqlQuery);
  useEffect(() => {
    if (!loading && !error && data){
      data.getCampaign.startDate && setStartDate(parseInt(data.getCampaign.startDate))
      data.getCampaign.endDate && setEndDate(parseInt(data.getCampaign.endDate));
      if (data.getCampaign.endDate === ''){
	setEndDate('');
      }
    }}
    , [loading, error, data])

  if (loading) return (
    <Container>
      <br/> <br/>
      <h2> Checking campaign status...</h2>
    </Container>
  )
  if (error){
    return <p>ERROR: {error.message}</p>
  }

  let {picture, status, goal, description, who, url, cause, pay2AuthAddress} = data.getCampaign
  const message = urlParams.get('message')

  if(urlParams.get('picture')){picture = urlParams.get('picture')}

  return(
    <Container>
      <NavMenu/>
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
	      <Form.Field as="h2">
		<label>Website</label>
		<input name="url" defaultValue={url|| null} placeholder='Link to organisation of more info' />
	      </Form.Field>
		<label>Goal</label>
		<input pattern="^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$" name="goal" defaultValue={goal || null} placeholder='Amount in BTC' />
	      </Form.Field>
	      <Form.Field as="h2">
		<label>Dates </label>
		<>
		  { !openEnded &&
		  <DatePicker 
		    selected={startDate} 
		    onChange={date => setStartDate(date)} 
		  />}
		  {openEnded &&
		    <>
		      <DatePicker
			selected={startDate}
			onChange={date => setStartDate(date)}
			selectsStart
			startDate={startDate}
			endDate={endDate}
		      />
		      <DatePicker
			selected={endDate}
			onChange={date => setEndDate(date)}
			selectsEnd
			startDate={startDate}
			endDate={endDate}
			minDate={startDate}
		      />
		    </>
		  }
		  <br/>
		  <Checkbox toggle onChange={()=>{
		    setOpenEnded(!openEnded)
		    setEndDate('') 
		  }} label='Open Ended'/>
		  <input type="hidden" name="endDate" value={endDate===''? endDate :(new Date(endDate).getTime())}/>
		  <input type="hidden" name="startDate" value={(new Date(startDate).getTime())}/>
		</>
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
	    {status === "FIRSTEDIT" && active === 'details' &&
	      <BitAuth pay2AuthAddress={pay2AuthAddress}/>
	    }
	    <>
	      <Form.Field>
		<input type="hidden" name="address" value={urlParams.get('address')}/>
	      </Form.Field>
	      {picture !== null &&
	      <Form.Field>
		<input type="hidden" name="picture" value={picture}/>
	      </Form.Field>
	      }
	      { active === 'details' &&
		<Button primary size="massive" type='submit'>
		  <i class="save icon"></i>
		  Save</Button>
	      }
	    </>
	  </Form>
	</Segment>
	<Header as="h3" style={{color:"Gray"}}>
	  <a href={'https://bitfundme.rocks/Campaign?address='+urlParams.get('address')} >
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
