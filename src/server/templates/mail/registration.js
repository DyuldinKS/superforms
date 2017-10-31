import render from './registration.hbs';

export default ({
	email,
	name,
	link,
	passSettingLing,
}) => ({
	to: email,
	subject: 'Регистрация в ИС «Генератор Форм»',
	html: render({ name, link, passSettingLing }),
});
