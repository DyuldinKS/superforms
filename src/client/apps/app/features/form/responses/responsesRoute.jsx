import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Card,
  Jumbotron,
} from 'reactstrap';
import * as formsModule from 'apps/app/shared/redux/forms';
import ResponsesList from './components/ResponsesList';

const propTypes = {
  match: PropTypes.object.isRequired,
  // from Redux
  id: PropTypes.string.isRequired,
  fetching: PropTypes.bool,
  fetchError: PropTypes.string,
  responses: PropTypes.array,
  fetchResponses: PropTypes.func.isRequired,
};

const defaultProps = {
  fetching: true,
  fetchError: null,
  responses: [],
};

class FormResponses extends Component {
  componentDidMount() {
    const { id, fetchResponses } = this.props;
    fetchResponses(id);
  }

  render() {
    const { match, responses } = this.props;
    const { url } = match;
    const amount = responses.length;

    return (
      <div className="form-responses container">
        <Jumbotron>
          <h1 className="display-4">{`Получено ответов: ${amount}`}</h1>
          <hr className="my-2" />
          <p>Для работы с ответами вы можете скачать таблицу в формате XLSX</p>
          <Button size="lg" color="success">Скачать таблицу</Button>
        </Jumbotron>

        <h3>Журнал ответов</h3>
        <ResponsesList
          path={url}
          entries={responses}
        />
      </div>
    );
  }
}

FormResponses.propTypes = propTypes;
FormResponses.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const formId = ownProps.match.params.id;
  const {
    fetching,
    fetchError,
    list: responses,
  } = formsModule.selectors.getResponses(state, formId);

  return {
    id: formId,
    fetching,
    fetchError,
    responses,
  };
}

const mapDispatchToProps = {
  fetchResponses: formsModule.actions.fetchResponses,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormResponses);
