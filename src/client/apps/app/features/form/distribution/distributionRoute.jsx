import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as formsModule from 'apps/app/shared/redux/forms';
import {
  Button,
  Jumbotron,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Label,
} from 'reactstrap';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  sent: PropTypes.object,
};

const defaultProps = {
  sent: null,
};

class DistributionRoute extends Component {
  constructor(props) {
    super(props);
  }

  renderStartScreen() {
    return (
      <div className="form-distribution">
        <Jumbotron className="form-distribution-start-screen">
          <h1 className="display-4">Сбор ответов еще не ведется</h1>
          <hr className="my-2" />
          <p>Начав сбор ответов, вы не сможете вносить изменения в структуру формы</p>
          <p className="lead">
            <Button color="primary">Начать сбор ответов</Button>
          </p>
        </Jumbotron>
      </div>
    );
  }

  render() {
    const { sent } = this.props;

    // return this.renderStartScreen();

    return (
      <div className="form-distribution container">
        <Card className="form-distribution-public-link">
          <CardHeader>Доступ по ссылке</CardHeader>
          <CardBody>
            <FormGroup>
              <Label>Ссылочка</Label>
              <InputGroup>
                <Input
                  type="text"
                  name="title"
                  readOnly
                  value="http://gf.imc-mosk.ru:40080/forms/6wOBKykYK"
                />
                <div className="input-group-append">
                  <Button color="primary">
                    Копировать
                  </Button>
                </div>
              </InputGroup>
            </FormGroup>
          </CardBody>
        </Card>
      </div>
    );
  }
}

DistributionRoute.propTypes = propTypes;
DistributionRoute.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.match.params;
  const { sent } = formsModule.selectors.getFormEntity(state, id);

  return {
    id,
    sent,
  };
}

export default connect(mapStateToProps, null)(DistributionRoute);
