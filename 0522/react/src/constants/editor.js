export const formats = [
	'font',
	'header',
	'bold',
	'italic',
	'underline',
	'strike',
	'blockquote',
	'list',
	'bullet',
	'indent',
	'link',
	'align',
	'color',
	'background',
	'size',
	'h1',
];

export const modules = {
	toolbar: {
		container: [
			[{ size: ['small', false, 'large', 'huge'] }],
			[{ align: [] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			[
				{
					color: [],
				},
				{ background: [] },
			],
		],
	},
};
