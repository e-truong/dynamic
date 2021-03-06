import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Clock from '../Clock/Clock';
import Icebreaker from './Components/Icebreaker/Icebreaker';
import './Activity.scss';

class Activity extends Component {

  static propTypes = {
    pid: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    console.log('CONSTRUCTOR [ACTIVITY]');
    const { pid, session_id } = props;
    this.state = {
      timeLeft: 0,
      duration: 10,
      session: Sessions.findOne(session_id),
      username: Users.findOne({pid}).name,
      currentActivity: null, // id of the running activity
    }
  }


  prettyPrint() {
    if (!this.props.currentActivity) return "No active activity yet.";
    return <div>
      <b>{this.state.username}</b>
      <div>_id: {this.props.currentActivity._id}</div>
      <div>name: {this.props.currentActivity.name}</div>
      <div>status: {this.props.currentActivity.status}</div>
      <div>session_id: {this.props.currentActivity.session_id}</div>
      <div>created: {(new Date().getTime() - this.props.currentActivity.timestamp) / 1000} secs ago</div>
      <div>teams: {this.props.currentActivity.teams.map(team => <div>{team}</div>)}</div>
    </div>
  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // called every second
  tick() {
    if (!this.props.currentActivity) clearInterval(this.timerID);
    this.setState({
      timeLeft: this.state.duration - parseInt(Math.abs(this.props.currentActivity.startTime - new Date().getTime()) / 1000)
    });
  }

  // needs a current activity
  render() {

    const { pid, currentActivity } = this.props;

    if (!currentActivity) return <Wrapper><h3 id="navbar">Dynamic</h3>Wait for your intrustor to begin.<img id="moving-logo" src="./dynamic.gif" className="center"/></Wrapper>

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (currentActivity.name === "Icebreaker") {
      return (
        <Wrapper>
          {/* {this.state.timeLeft >= 0 && <Clock timeLeft={this.state.timeLeft}/>} */}
          <Icebreaker _id={currentActivity._id} pid={pid} />
        </Wrapper>
      )
    } else {
      return "Something went wrong. Invalid activity."
    }
  }

}

export default withTracker(props => {
  const session_id = props.session_id;
  const currentActivity = Activities.findOne({session_id, status: { $in: [1, 2, 3] }}, { sort: { status: 1 }});
  return {currentActivity}
})(Activity);