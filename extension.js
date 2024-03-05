// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { posix } = require('path');
const { type } = require('os');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let currentPanel = 0


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sample" is now active!');


	let favorite = vscode.commands.registerCommand('flowo.favorite', async function () {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, './.vscode/flowo.json')
		let _config = {
			favs: []
		}
		try {
			await vscode.workspace.fs.stat(defaultUri);
			const readData = await vscode.workspace.fs.readFile(defaultUri);
			const readStr = Buffer.from(readData).toString('utf-8');
			let json = JSON.parse(readStr)

			if (typeof json === 'object') {
				_config = json
			}

		} catch {
			const writeData = Buffer.from('', 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}

		if (_config.favs && _config.favs.length > 0) {
			let items = _config.favs.map(v => {
				return { label: v.name, description: v.description }
			})
			await vscode.window.showQuickPick(items, {
				title: 'Choose Favorite',
				canPickMany: false
			}).then((val) => {
				if (val) {
					let pickUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, val.description)
					vscode.window.showTextDocument(pickUri)
				} else {
					return
				}
			}, () => {
				return
			})
		}
	});


	let newFav = vscode.commands.registerCommand('flowo.newFav', async function () {
		// The code you place here will be executed every time your command is executed
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, './.vscode/flowo.json')
		let _config = {
			favs: []
		}
		try {
			await vscode.workspace.fs.stat(defaultUri);
			const readData = await vscode.workspace.fs.readFile(defaultUri);
			const readStr = Buffer.from(readData).toString('utf-8');
			let json = JSON.parse(readStr)

			if (typeof json === 'object') {
				_config = json
			}

		} catch {
			const writeData = Buffer.from('', 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}
		if (!_config.favs) {
			_config.favs = []
		}
		if (vscode.window.activeTextEditor) {
			let activeTextEditorUri = vscode.window.activeTextEditor.document.uri
			let relativePath = activeTextEditorUri.path.replace(vscode.workspace.workspaceFolders[0].uri.path, '')
			if (_config.favs.findIndex((v) => v.description === relativePath) > -1) {
				return vscode.window.showInformationMessage('Favorite exist!! [' + posix.basename(activeTextEditorUri.path) + ']')
			}
			let name = posix.basename(activeTextEditorUri.path)

			_config.favs.push({ name, description: relativePath })

			const writeData = Buffer.from(JSON.stringify(_config), 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
			vscode.window.showInformationMessage('Add Favorite [' + posix.basename(activeTextEditorUri.path) + ']')
		}

	});

	let newMarkdown = vscode.commands.registerCommand('flowo.newMarkdown', async function () {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, './.vscode/flowo.json')
		let _config = {
			paths: ['/']
		}
		try {
			await vscode.workspace.fs.stat(defaultUri);
			const readData = await vscode.workspace.fs.readFile(defaultUri);
			const readStr = Buffer.from(readData).toString('utf-8');
			let json = JSON.parse(readStr)

			if (typeof json === 'object') {
				_config = json
			}

		} catch {
			const writeData = Buffer.from('', 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}
		let folderObj = null
		if (!_config.paths || _config.paths.length === 0) {
			_config.paths = ['/']

			const writeData = Buffer.from(JSON.stringify(_config), 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}
		if (_config.paths && _config.paths.length > 1) {
			let items = _config.paths.map(v => {
				if (typeof v === 'string') {
					return { label: v }
				}
				if (typeof v === 'object') {
					return { label: v.name, description: v.description }
				}
			})
			folderObj = await vscode.window.showQuickPick(items, {
				title: 'Choose Path To Create',
				canPickMany: false,
			})
		}
		if (_config.paths && _config.paths.length === 1) {
			folderObj = _config.paths[0]
		}


		if (folderObj) {
			let folderPath = typeof folderObj === 'string' ? folderObj : folderObj.description ? folderObj.description : folderObj.label
			let folderUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, folderPath)
			await vscode.window.showInputBox({
				title: 'Markdown File Name',
				placeHolder: 'Empty for current time'
			}).then(async val => {
				if (val === undefined) {
					return
				}
				let mdName = val ? val : format(new Date(), 'yyyy-MM-dd_hh_mm_ss')
				let fileUri = vscode.Uri.joinPath(folderUri, './' + mdName + '.md')
				try {
					await vscode.workspace.fs.stat(fileUri);
					vscode.window.showInformationMessage('File exist!!')
				} catch {
					const writeData = Buffer.from('# ' + mdName + '\n\n', 'utf8');
					await vscode.workspace.fs.writeFile(fileUri, writeData)
					vscode.window.showTextDocument(fileUri)
				}
			})
		} else {
			return
		}
	});

	let randomFile = vscode.commands.registerCommand('flowo.randomFile', async () => {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, './.vscode/flowo.json')
		let _config = {
		}
		try {
			await vscode.workspace.fs.stat(defaultUri);
			const readData = await vscode.workspace.fs.readFile(defaultUri);
			const readStr = Buffer.from(readData).toString('utf-8');
			let json = JSON.parse(readStr)

			if (typeof json === 'object') {
				_config = json
			}
		} catch {

		}
		const files = await vscode.workspace.findFiles('**/*');
		const paths = _config.randomPaths
		const filterFile = (element) => {
			// return !element.path.startsWith('node_modules');
			if (element.path.includes('node_modules'))
				return false;
			if (!paths || paths.length === 0) {
				return true;
			}
			for (const path of paths) {
				if (element.path.includes(path)) {
					return true;
				}
			}
			return false;
		};
		const passedFiles = files.filter(filterFile);
		if (passedFiles.length > 0) {
			console.log('open file');

			const randomFile = passedFiles[Math.floor(Math.random() * passedFiles.length)];
			vscode.window.showTextDocument(randomFile).then(textEdit => { }, err => {
				vscode.window.showInformationMessage(err.message)
			})
		}
	})



	let insert = vscode.commands.registerTextEditorCommand('flowo.insert', async (editor, edit) => {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, './.vscode/flowo.json')
		let _config = {
			inserts: [{
				name: 'short name',
				description: ' insert content'
			}]
		}
		try {
			await vscode.workspace.fs.stat(defaultUri);
			const readData = await vscode.workspace.fs.readFile(defaultUri);
			const readStr = Buffer.from(readData).toString('utf-8');
			let json = JSON.parse(readStr)

			if (typeof json === 'object') {
				_config = json
			}

		} catch {
			const writeData = Buffer.from('', 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}
		let insertObj = null
		if (!_config.inserts || _config.inserts.length === 0) {
			_config.inserts = [{
				name: 'short name',
				description: ' insert content'
			}]

			const writeData = Buffer.from(JSON.stringify(_config), 'utf8');
			await vscode.workspace.fs.writeFile(defaultUri, writeData)
		}
		if (_config.inserts && _config.inserts.length > 0) {
			let items = _config.inserts.map(v => {
				if (typeof v === 'string') {
					return { label: v }
				}
				if (typeof v === 'object') {
					return { label: v.name, description: v.description }
				}
			})
			items.push({ label: 'lifetime', description: 'year past & life past' })
			insertObj = await vscode.window.showQuickPick(items, {
				title: 'Quick Insert',
				canPickMany: false,
			})
		}


		if (insertObj) {
			let insertStr = insertObj.description ? insertObj.description : insertObj.label

			editor.selections.forEach((selection, i) => {
				editor.edit((editBuilder) => {
					if (insertStr == 'year past & life past') {
						if (_config.birthday) {
							if (birthdayValidator(_config.birthday)
							) {
								let times = _config.birthday.split('-')
								const now = new Date();
								const yearStart = new Date(now.getFullYear(), 0, 1); // 11 represents December (0-indexed)
								const birthday = new Date(times[0], times[1]-1, times[2]); // 11 represents December (0-indexed)
								const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
								// Calculate the difference between today and the end of the year
								const daysPastYear = Number(Math.ceil((now - yearStart) / millisecondsPerDay) / 365).toFixed(2);
								const daysPastLife = Number(Math.ceil((now - birthday) / millisecondsPerDay) / (365 * 60 / 100)).toFixed(2);
								editBuilder.insert(selection.active, `今年进程${daysPastYear}% 人生进程${daysPastLife}%`)
								return
							}
						console.log(birthdayValidator(_config.birthday));

						}
						console.log(_config.birthday);
						console.log(111111111);
						editBuilder.insert(selection.active, 'birthday errro in flowo.json')
					}
					editBuilder.insert(selection.active, insertStr)
				})
			})
		}
	});


	context.subscriptions.push(newFav);
	context.subscriptions.push(favorite);
	context.subscriptions.push(newMarkdown);
	context.subscriptions.push(randomFile);
	context.subscriptions.push(insert);
}

// This method is called when your extension is deactivated
function deactivate() { }



module.exports = {
	activate,
	deactivate
}


//date指的是new Date(),fmt是格式化的格式
const format = (date, fmt) => {
	var o = {
		"M+": date.getMonth() + 1,                 //月份 
		"d+": date.getDate(),                    //日 
		"h+": date.getHours(),                   //小时 
		"m+": date.getMinutes(),                 //分 
		"s+": date.getSeconds(),                 //秒 
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度 
		"S": date.getMilliseconds()             //毫秒 
	};
	//(y+)匹配多个y，比如yyyy
	if (/(y+)/.test(fmt)) {
		// RegExp.$1是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;

}

const birthdayValidator = (birthday) => {
	const rlt = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(birthday)
	if (rlt) {
		return true
	} else {
		return false
	}
}

