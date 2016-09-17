var React = require('react');
var ReactDOM = require('react-dom');
var { Router, Route, IndexRoute, browserHistory } = require('react-router');

require('whatwg-fetch');

var Replacer = require('./replacer');
var { apiFetch, debugError } = require('./util');


var App = React.createClass({

  getInitialState: function() {
    return {
      loading: true,
      auth: false, // have we oauthed?
      user: {},
      error: undefined
    }
  },

  componentWillMount: function() {

    this.replaceHash();
    this.getUser();

  },

  // remove the #_=_ that comes back from tumblr oauth
  replaceHash: function() {
    if (window.location.hash && window.location.hash == '#_=_') {
      window.history.pushState('', document.title, window.location.pathname);
    }
  },

  // get user data
  // this will also check to see if we've already oauthed
  getUser: function() {
    apiFetch('GET', '/user')
    .then(function(user) {
      this.setState({
        auth: true,
        loading: false,
        user: {
          name: user.name,
          blogs: user.blogs
        }
      });
    }.bind(this))
    .catch(function(error) {
      debugError(error);
      this.setState({
        error: error,
        loading: false,
        auth: false
      });
    }.bind(this));
  },

  // render

  renderError: function() {
    if (this.state.error !== undefined) {
      if (this.state.error.message !== 'No user session') {
        return (<div className="error">{this.state.error.message}</div>);
      }
    }
  },

  render: function() {
    var authLink = <a href="/connect/tumblr">connect to tumblr</a>;

    return (<div className="app">
      <header>
        <h1>tag replacer</h1>
        <nav>
          {this.state.auth && !this.state.loading ? <a href="/disconnect">disconnect</a> : null}
        </nav>
      </header>
      {this.renderError()}
      {this.state.loading ? 'loading' : null}
      {!this.state.auth && !this.state.loading ? authLink : null}
      {this.state.auth && !this.state.loading ? <Replacer blogs={this.state.user.blogs} /> : null}
    </div>);
  }

});


ReactDOM.render(<App />, document.querySelector('.container'));
