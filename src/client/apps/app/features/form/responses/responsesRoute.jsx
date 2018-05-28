import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Card,
  Jumbotron,
} from 'reactstrap';
import FormAPI from 'api/FormAPI';
import download from 'shared/utils/download';
import * as formsModule from 'apps/app/shared/redux/forms';
import ResponsesList from './components/ResponsesList';
import ResponseModal from './components/ResponseModal';

const propTypes = {
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
  constructor(props) {
    super(props);

    this.state = {
      modalId: null,
    };

    this.fetchResponsesXLSX = this.fetchResponsesXLSX.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  componentDidMount() {
    const { id, fetchResponses } = this.props;
    fetchResponses(id);
  }

  async fetchResponsesXLSX() {
    const { id } = this.props;
    const xlsxBuffer = await FormAPI.getResponsesInXLSX(id);
    const blob = new Blob([new Uint8Array(xlsxBuffer.data)]);
    download(
      blob,
      'report.xlsx',
    );
  }

  showModal(respId) {
    this.setState(() => ({ modalId: respId }));
  }

  hideModal() {
    this.setState(() => ({ modalId: null }));
  }

  renderResponseModal() {
    return (
      <ResponseModal
        formId={this.props.id}
        respId={this.state.modalId}
        hideModal={this.hideModal}
      />
    );
  }

  render() {
    const { responses } = this.props;
    const amount = responses.length;

    return (
      <div className="form-responses container">
        <Jumbotron>
          <h1 className="display-4">{`Получено ответов: ${amount}`}</h1>
          <hr className="my-2" />
          <p>Для работы с ответами вы можете скачать таблицу в формате XLSX</p>
          <Button
            size="lg"
            color="success"
            onClick={this.fetchResponsesXLSX}
          >
            Скачать таблицу
          </Button>
        </Jumbotron>

        <h3>Журнал ответов</h3>
        <ResponsesList
          entries={responses}
          onSelect={this.showModal}
        />

        {this.state.modalId && this.renderResponseModal()}
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
