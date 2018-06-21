import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import { RolesOptions } from './components';
import Breadcrumb from '../shared/components/Breadcrumb';
import { BaseComponent, ErrorPanel } from '../shared/components';
import { connectNewUser } from '../shared/components/connect';

const propTypes = {
  // from Redux
  parentId: PropTypes.number.isRequired,
  parentOrgName: PropTypes.string.isRequired,
  createUser: PropTypes.func.isRequired,
};

const defaultProps = {};

class CreateUserRoute extends BaseComponent {
  constructor(props) {
    super(props);

    this.requiredFields = ['lastName', 'firstName', 'email', 'role'];

    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(values) {
    const response = await this.props.createUser(values);
    return response;
  }

  render() {
    const { parentId, parentOrgName } = this.props;
    const { error, uploading } = this.state;

    return (
      <React.Fragment>
        <Breadcrumb id={parentId} lastLabel="Новый пользователь" />
        <div className="container app-creation">
          <h1>Новый пользователь</h1>

          <Form onSubmit={this.handleSubmit} className="app-creation-form">
            <Card className="app-creation-form-entity">
              <CardHeader>
                Информация о пользователе
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for="lastname">Фамилия</Label>
                  <Input
                    name="lastName"
                    value={this.getValue('lastName')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="firstName">Имя</Label>
                  <Input
                    name="firstName"
                    value={this.getValue('firstName')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="patronymic">Отчество</Label>
                  <Input
                    name="patronymic"
                    value={this.getValue('patronymic')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="email">Электронная почта</Label>
                  <Input
                    name="email"
                    value={this.getValue('email')}
                    onChange={this.handleInputChange}
                  />
                </FormGroup>
              </CardBody>
            </Card>

            <Card className="app-creation-form-location">
              <CardHeader>
                Принадлежность к организации
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for="org">Организация</Label>
                  <Input
                    name="org"
                    disabled
                    value={parentOrgName}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="role">Роль</Label>
                  <Input
                    name="role"
                    type="select"
                    value={this.getValue('role')}
                    onChange={this.handleInputChange}
                  >
                    <RolesOptions />
                  </Input>
                </FormGroup>

                <FormGroup className="app-creation-form-submit-outer">
                  {
                    error
                      ? <ErrorPanel message={error} />
                      : null
                  }
                  <Button type="submit" color="primary">
                    {
                      uploading
                        ? 'Добавление'
                        : 'Добавить'
                    }
                  </Button>
                </FormGroup>
              </CardBody>
            </Card>
          </Form>
        </div>
      </React.Fragment>
    );
  }
}

CreateUserRoute.propTypes = propTypes;
CreateUserRoute.defaultProps = defaultProps;

export default connectNewUser(CreateUserRoute);
