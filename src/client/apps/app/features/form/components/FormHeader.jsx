import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import * as formsModule from 'apps/app/shared/redux/forms';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

class FormHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { title } = this.props;

    return (
      <div className="form-generator-header container">
        <Button color="link" className="back" title="К списку форм">
          <i className="fas fa-arrow-left" />
        </Button>

        <h1 title={title}>
          {title}
        </h1>
      </div>
    );
  }
}

FormHeader.propTypes = propTypes;
FormHeader.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;
  const { title } = formsModule.selectors.getFormEntity(state, id);

  return {
    title,
  };
}

export default connect(mapStateToProps)(FormHeader);
