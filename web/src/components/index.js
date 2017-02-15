import React, { Component } from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { auth, db } from '../config/constants'
import Base from './Base'
import Home from './Home'
import Dashboard from './dashboard/Dashboard'
import SpeakersList from './speakers/SpeakersList'
import Speaker from './speakers/Speaker'
import EditSpeaker from './speakers/EditSpeaker'

export default class App extends Component {

  state = {
    authed: false,
    admin: false
  }
  adminUsers = []

  constructor() {
    super()
    this.requireAdmin = this.requireAdmin.bind(this)
  }

  componentDidMount() {
    this.users = db.child('admins')
    this.users.on('value', snapshot => {
      this.adminUsers = snapshot.val()
      this.setState({
        authed: auth.currentUser !== null,
        admin: this.adminUsers.includes(auth.currentUser.email)
      })
    })
    this.removeListener = auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: true,
          admin: this.adminUsers.includes(user.email)
        })
      } else {
        this.setState({
          authed: false,
          admin: false
        })
      }
    })
  }

  componentWillUnmount() {
    this.users.off()
    this.removeListener()
    this.setState({
      authed: false,
      admin: false
    })
    browserHistory.pop()
  }

  requireAdmin(nextState, replace) {
    if (!this.state.admin) {
      replace({
        pathname: '/'
      })
    }
  }

  render() {
    const routeConfig = [
      {
        path: '/',
        component: Base,
        indexRoute: { component: Home },
        childRoutes: [
          {
            path: '/dashboard',
            component: Dashboard,
            onEnter: this.requireAdmin
          },
          {
            path: '/speakers/:speakerId/edit',
            component: EditSpeaker,
            onEnter: this.requireAdmin
          },
          {
            path: '/speakers/:speakerId',
            component: Speaker,
            onEnter: this.requireAdmin
          },
          {
            path: '/speakers',
            component: SpeakersList,
            onEnter: this.requireAdmin
          }
        ]
      }
    ]
    return (
      <Router history={browserHistory} routes={routeConfig}/>
    )
  }
}
