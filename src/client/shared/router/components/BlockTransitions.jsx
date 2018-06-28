import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { actions }  from 'shared/router/redux';

const propTypes = {
  when: PropTypes.bool,
  message: PropTypes.string,
  // from Redux
  block: PropTypes.func.isRequired,
  unblock: PropTypes.func.isRequired,
};

const defaultProps = {
  when: true,
  message: 'На странице остались несохраненные изменения. Вы действительно хотите покинуть страницу без сохранения?',
};

class BlockTransitions extends Component {
  constructor(props) {
    super(props);

    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  componentWillMount() {
    if (this.props.when) this.enable();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.when) {
      if (!this.props.when) {
        this.enable();
      }
    } else {
      this.disable();
    }
  }

  componentWillUnmount() {
    if (this.props.when) this.disable();
  }

  enable() {
    this.props.block(this.props.message);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  disable() {
    this.props.unblock();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  handleBeforeUnload(e) {
    const confirmationMessage = this.props.message;

    e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
    return confirmationMessage;              // Gecko, WebKit, Chrome <34
  }

  render() {
    return null;
  }
}

BlockTransitions.propTypes = propTypes;
BlockTransitions.defaultProps = defaultProps;

const mapDispatchToProps = {
  block: actions.block,
  unblock: actions.unblock,
};

export default connect(null, mapDispatchToProps)(BlockTransitions);
