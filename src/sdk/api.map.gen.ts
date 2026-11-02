import { sseOp, type ServiceMap } from "./api.runtime.gen"

export const serviceMap: ServiceMap = {
	batch: {
		download: {
			csv: {
				accept: "text/csv",
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/csv",
			},
			json: {
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/json",
			},
			xlsx: {
				accept: "application/octet-stream",
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/xlsx",
			},
		},
		list: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/batches",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "batch_id"],
			path: "/v1/projects/{project_id}/batches/{batch_id}",
		},
	},
	column: {
		add: {
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns",
		},
		distinct: {
			method: "GET",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}/distinct",
		},
		remove: {
			method: "DELETE",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}",
		},
		reorder: {
			method: "PUT",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/order",
		},
		update: {
			method: "PATCH",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}",
		},
	},
	export: {
		retrieve: {
			method: "GET",
			params: ["project_id", "export_id"],
			path: "/v1/projects/{project_id}/exports/{export_id}",
		},
	},
	extract: {
		once: {
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/extract",
		},
		stream: {
			call: sseOp,
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/extract-stream",
			sse: true,
		},
		table: {
			once: {
				method: "POST",
				params: ["project_id", "table_id"],
				path: "/v1/projects/{project_id}/tables/{table_id}/extract",
			},
			stream: {
				call: sseOp,
				method: "POST",
				params: ["project_id", "table_id"],
				path: "/v1/projects/{project_id}/tables/{table_id}/extract-stream",
				sse: true,
			},
		},
	},
	row: {
		aggregate: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/aggregate",
		},
		bulk: {
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/bulk",
		},
		create: {
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows",
		},
		delete: {
			method: "DELETE",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
		list: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
		source: {
			accept: "application/octet-stream",
			method: "GET",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}/source",
		},
		update: {
			method: "PATCH",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
	},
	suggest: {
		schema: {
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/suggest-schema",
		},
	},
	table: {
		create: {
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/tables",
		},
		delete: {
			method: "DELETE",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
		duplicate: {
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/duplicate",
		},
		export: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/export",
		},
		list: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/tables",
		},
		restore: {
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/restore",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
		update: {
			method: "PATCH",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
	},
	tableTemplate: {
		create: {
			method: "POST",
			path: "/v1/table-templates",
		},
		delete: {
			method: "DELETE",
			params: ["template_id"],
			path: "/v1/table-templates/{template_id}",
		},
		listMine: {
			method: "GET",
			path: "/v1/table-templates/mine",
		},
		projectList: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/table-templates",
		},
		projectRetrieve: {
			method: "GET",
			params: ["project_id", "template_id"],
			path: "/v1/projects/{project_id}/table-templates/{template_id}",
		},
		update: {
			method: "PATCH",
			params: ["template_id"],
			path: "/v1/table-templates/{template_id}",
		},
		use: {
			method: "POST",
			params: ["project_id", "template_id"],
			path: "/v1/projects/{project_id}/table-templates/{template_id}/use",
		},
	},
	webhook: {
		create: {
			method: "POST",
			params: ["organization_id"],
			path: "/v1/organizations/{organization_id}/webhooks",
		},
		delete: {
			method: "DELETE",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}",
		},
		deliveries: {
			method: "GET",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}/deliveries",
		},
		list: {
			method: "GET",
			params: ["organization_id"],
			path: "/v1/organizations/{organization_id}/webhooks",
		},
		retrieve: {
			method: "GET",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}",
		},
		rotateSecret: {
			method: "POST",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}/rotate-secret",
		},
		test: {
			method: "POST",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}/test",
		},
		update: {
			method: "PATCH",
			params: ["organization_id", "id"],
			path: "/v1/organizations/{organization_id}/webhooks/{id}",
		},
	},
}
