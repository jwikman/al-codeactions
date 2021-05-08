import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ALObject } from '../Entities/alObject';
import { ALProcedure } from '../Entities/alProcedure';
import { ALSourceCodeHandler } from "../Utils/alSourceCodeHandler";
import { CreateProcedureCommands } from '../Create Procedure/CreateProcedureCommands';
import { CreateProcedure } from '../Create Procedure/Procedure Creator/CreateProcedure';
import { CreateProcedureAL0132 } from '../Create Procedure/Procedure Creator/CreateProcedureAL0132';
import { ICodeActionProvider } from "./ICodeActionProvider";
import { WorkspaceUtils } from '../Utils/workspaceUtils';
import { CreateProcedureAL0132IntegrationEvent } from '../Create Procedure/Procedure Creator/CreateProcedureAL0132IntegrationEvent';
import { CreateProcedureAL0132BusinessEvent } from '../Create Procedure/Procedure Creator/CreateProcedureAL0132BusinessEvent';
import { Err } from '../Utils/Err';
import { TextDocument, Diagnostic, CodeAction, workspace, CodeActionKind } from "vscode";

export class CodeActionProviderAL0132 implements ICodeActionProvider {
    syntaxTree: SyntaxTree | undefined;
    document: TextDocument;
    diagnostic: Diagnostic;
    createProcedureAL0132: CreateProcedureAL0132 | undefined;
    constructor(document: TextDocument, diagnostic: Diagnostic) {
        this.document = document;
        this.diagnostic = diagnostic;
    }
    async considerLine(): Promise<boolean> {
        this.syntaxTree = await SyntaxTree.getInstance(this.document);
        if (await new ALSourceCodeHandler(this.document).isInvocationExpression(this.diagnostic.range)) {
            this.createProcedureAL0132 = new CreateProcedureAL0132(this.document, this.diagnostic);
            let objectOfNewProcedure: ALObject = await this.createProcedureAL0132.getObject();
            if (this.canObjectContainProcedures(objectOfNewProcedure)) {
                return true;
            }
        }
        return false;
    }

    async createCodeActions(): Promise<CodeAction[]> {
        if (!this.createProcedureAL0132) {
            Err._throw('considerLine has to be called first.');
        }
        let codeActions: CodeAction[] = [];
        let procedure: ALProcedure = await CreateProcedure.createProcedure(this.createProcedureAL0132);
        if (!this.isValidDocument(procedure))
            return []
        let codeActionProcedure: CodeAction = await this.createCodeAction('Create procedure ' + procedure.name, procedure);
        codeActionProcedure.isPreferred = true;

        let prefixes: string[] | undefined = await WorkspaceUtils.findValidAppSourcePrefixes(this.document.uri);
        let regexPattern: RegExp = prefixes ? new RegExp("^(" + prefixes.join('|') + "|" + prefixes.join('_|') + "_)?On[A-Za-z].*$") : new RegExp("^On[A-Za-z].*$");
        if (procedure.name.match(regexPattern)) {
            let createProcedureAL0132IntegrationEvent: CreateProcedureAL0132IntegrationEvent = new CreateProcedureAL0132IntegrationEvent(this.document, this.diagnostic);
            let integrationEvent: ALProcedure = await CreateProcedure.createProcedure(createProcedureAL0132IntegrationEvent);
            let codeActionIntegrationEvent: CodeAction = await this.createCodeAction('Create IntegrationEvent Publisher ' + integrationEvent.name, integrationEvent);
            codeActionIntegrationEvent.isPreferred = true;
            codeActions.push(codeActionIntegrationEvent);

            let createProcedureAL0132BusinessEvent: CreateProcedureAL0132BusinessEvent = new CreateProcedureAL0132BusinessEvent(this.document, this.diagnostic);
            let businessEvent: ALProcedure = await CreateProcedure.createProcedure(createProcedureAL0132BusinessEvent);
            let codeActionBusinessEvent: CodeAction = await this.createCodeAction('Create BusinessEvent Publisher ' + businessEvent.name, businessEvent);//businessEvent, 'Create BusinessEvent Publisher ' + businessEvent.name, this.document, this.diagnostic);
            codeActions.push(codeActionBusinessEvent);
        } else
            codeActionProcedure.isPreferred = true
        codeActions.push(codeActionProcedure)
        return codeActions;
    }


    private canObjectContainProcedures(alObject: ALObject) {
        switch (alObject.type.toString().toLowerCase()) {
            case "enum":
                return false;
            default:
                return true;
        }
    }
    private isValidDocument(procedureToCreate: ALProcedure): boolean {
        if (procedureToCreate.ObjectOfProcedure.documentUri!.fsPath.endsWith('dal'))
            return false
        return true
    }
    private async createCodeAction(msg: string, procedureToCreate: ALProcedure): Promise<CodeAction> {
        let otherDocument: TextDocument = await workspace.openTextDocument(procedureToCreate.ObjectOfProcedure.documentUri!);
        let codeActionToCreateProcedure: CodeAction = this.createFixToCreateProcedure(msg, procedureToCreate, otherDocument);
        return codeActionToCreateProcedure;
    }

    private createFixToCreateProcedure(msg: string, procedure: ALProcedure, document: TextDocument): CodeAction {
        const codeAction = new CodeAction(msg, CodeActionKind.QuickFix);
        codeAction.command = {
            command: CreateProcedureCommands.createProcedureCommand,
            title: 'Create Procedure',
            arguments: [document, procedure]
        };
        return codeAction;
    }
}