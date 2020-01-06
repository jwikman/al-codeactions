import * as assert from 'assert';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { ALSourceCodeHandler } from '../../extension/alSourceCodeHandler';
import { ALTestProject } from './ALTestProject';
// import * as myExtension from '../extension';

suite('ALSourceCodeHandler Test Suite', function () {
	vscode.window.showInformationMessage('Start all tests of ALSourceCodeHandler.');
	let sampleCodeunitURI: vscode.Uri;

	//#region getALObjectOfDocument
	test('getALObjectOfDocument_ObjectNameWithoutSpace_BracketSameLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunitEmpty_MyCodeunit_BracketSameLine.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, 'MyCodeunit4');
			assert.equal(alObject.type, 'codeunit');
			assert.equal(alObject.id, 50106);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	test('getALObjectOfDocument_ObjectNameWithoutSpace_BracketNextLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunitEmpty_MyCodeunit_BracketNextLine.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, 'MyCodeunit3');
			assert.equal(alObject.type, 'codeunit');
			assert.equal(alObject.id, 50105);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	test('getALObjectOfDocument_ObjectNameWithSpace_BracketSameLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, "codeunitEmpty_'My Codeunit'_BracketSameLine.al");
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, '"My Codeunit"');
			assert.equal(alObject.type, 'codeunit');
			assert.equal(alObject.id, 50102);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	test('getALObjectOfDocument_ObjectNameWithoutSpaceWithQuotes_BracketSameLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, "codeunitEmpty_'MyCodeunit'_BracketSameLine.al");
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, '"MyCodeunit"');
			assert.equal(alObject.type, 'codeunit');
			assert.equal(alObject.id, 50103);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	test('getALObjectOfDocument_FirstLineHasComments', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunitEmpty_FirstLineHasComments.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, '"MyCodeunit2"');
			assert.equal(alObject.type, 'codeunit');
			assert.equal(alObject.id, 50104);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	test('getALObjectOfDocument_PageExtension', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'pageExtensionEmpty.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alObject = new ALSourceCodeHandler(document).getALObjectOfDocument();
			assert.equal(alObject.name, '"MyPageExtension"');
			assert.equal(alObject.type, 'pageextension');
			assert.equal(alObject.id, 50100);
			assert.equal(alObject.document?.uri.fsPath, document.uri.fsPath);
		});
	});
	//#endregion getALObjectOfDocument
	//#region getProcedureOrTriggerNameOfCurrentPosition
	test('getProcedureOrTriggerNameOfCurrentPosition_Procedure', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alProcedureName = new ALSourceCodeHandler(document).getProcedureOrTriggerNameOfCurrentPosition(8);
			assert.equal(alProcedureName, 'myProcedure');
		});
	});
	test('getProcedureOrTriggerNameOfCurrentPosition_Trigger', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let alTriggerName = new ALSourceCodeHandler(document).getProcedureOrTriggerNameOfCurrentPosition(4);
			assert.equal(alTriggerName, 'onRun');
		});
	});
	//#endregion getProcedureOrTriggerNameOfCurrentPosition
	//#region getPositionToInsertProcedure
	test('getPositionToInsertProcedure_WithLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let position = new ALSourceCodeHandler(document).getPositionToInsertProcedure(12);
			assert.equal(position.isEqual(new vscode.Position(14, 8)), true);
		});
	});
	test('getPositionToInsertProcedure_BetweenProcedures', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let position = new ALSourceCodeHandler(document).getPositionToInsertProcedure(5);
			assert.equal(position.isEqual(new vscode.Position(6, 8)), true);
		});
	});
	test('getPositionToInsertProcedure_WithoutLine', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let position = new ALSourceCodeHandler(document).getPositionToInsertProcedure(undefined);
			assert.equal(position.isEqual(new vscode.Position(41, 8)), true, `${position.line},${position.character}`);
		});
	});
	//#endregion getPositionToInsertProcedure

	//#region getRangeOfProcedureCall
	test('getRangeOfProcedureCall_WithoutParameters', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 21;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithoutParameters".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithoutParameters()".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_WithParameter', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 23;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithParameter".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithParameter(myInteger)".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_WithParameters', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 25;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithParameters".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithParameters(myInteger, myBoolean)".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_WithReturnValue', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 27;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithReturn".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "myText := MissingProcedureWithReturn(myInteger)".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_OtherCodeunit', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 29;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureOfOtherObject".length), 'test');
			diagnostic.code = 'AL0132';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "SecondCodeunit.MissingProcedureOfOtherObject(myInteger, myBoolean)".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_OtherCodeunitWithReturnValue', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 31;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureOfOtherObjectWithReturn".length), 'test');
			diagnostic.code = 'AL0132';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "myText := SecondCodeunit.MissingProcedureOfOtherObjectWithReturn(myInteger, myBoolean)".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_WithProcedureCallInside', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 33;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithProcedureCallInside".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			let expectedRange = new vscode.Range(lineNo, 8, lineNo, 8 + "MissingProcedureWithProcedureCallInside(myProcedure(5))".length);
			assert.equal(range?.isEqual(expectedRange), true);
		});
	});
	test('getRangeOfProcedureCall_WithDirectlyUsedReturnValue', async () => {
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 35;
			let startPos = 8 + "myProcedure(".length;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, startPos, lineNo, startPos + "MissingProcedureWithDirectlyUsedReturnValue".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			//TODO: not supported yet.
			assert.equal(range, undefined);
			// let expectedRange = new vscode.Range(lineNo, startPos, lineNo, startPos + "MissingProcedureWithDirectlyUsedReturnValue()".length);
			// assert.equal(range?.isEqual(expectedRange), true, `start: line ${range?.start.line}, char: ${range?.start.character}, end: line ${range?.end.line}, char ${range?.end.character}`);
		});
	});
	test('getRangeOfProcedureCall_Multiline', async () => {
		//TODO: not supported yet.
		let fileName = path.resolve(ALTestProject.dir, 'codeunit1.al');
		await vscode.workspace.openTextDocument(fileName).then(document => {
			let lineNo = 37;
			let diagnostic = new vscode.Diagnostic(new vscode.Range(lineNo, 8, lineNo, 8 + "MultilineProcedureCall".length), 'test');
			diagnostic.code = 'AL0118';
			diagnostic.source = 'al';
			let range = new ALSourceCodeHandler(document).getRangeOfProcedureCall(diagnostic.range);
			assert.equal(range, undefined);
		});
	});
	//#endregion getRangeOfProcedureCall
});