package firestore

import (
	"context"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/infrastructure/observability"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
)

// InstrumentedCollection wraps a Firestore collection reference with OpenTelemetry tracing
type InstrumentedCollection struct {
	*firestore.CollectionRef
	collectionName string
}

// CollectionWithTracing returns an instrumented collection reference
func (c *Client) CollectionWithTracing(path string) *InstrumentedCollection {
	return &InstrumentedCollection{
		CollectionRef:  c.client.Collection(path),
		collectionName: path,
	}
}

// Doc returns a document reference (inherited from CollectionRef)
// This is kept for compatibility - spans are added at operation level

// SetWithTracing performs a Set operation with tracing
func (ic *InstrumentedCollection) SetWithTracing(ctx context.Context, docID string, data interface{}) error {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.set")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "set"),
		attribute.String("db.collection", ic.collectionName),
		attribute.String("db.document", docID),
	)

	doc := ic.Doc(docID)
	_, err := doc.Set(ctx, data)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	span.SetStatus(codes.Ok, "")
	return nil
}

// GetWithTracing performs a Get operation with tracing
func (ic *InstrumentedCollection) GetWithTracing(ctx context.Context, docID string) (*firestore.DocumentSnapshot, error) {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "get"),
		attribute.String("db.collection", ic.collectionName),
		attribute.String("db.document", docID),
	)

	doc := ic.Doc(docID)
	snapshot, err := doc.Get(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	span.SetStatus(codes.Ok, "")
	return snapshot, nil
}

// UpdateWithTracing performs an Update operation with tracing
func (ic *InstrumentedCollection) UpdateWithTracing(ctx context.Context, docID string, updates []firestore.Update) error {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "update"),
		attribute.String("db.collection", ic.collectionName),
		attribute.String("db.document", docID),
	)

	doc := ic.Doc(docID)
	_, err := doc.Update(ctx, updates)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	span.SetStatus(codes.Ok, "")
	return nil
}

// DeleteWithTracing performs a Delete operation with tracing
func (ic *InstrumentedCollection) DeleteWithTracing(ctx context.Context, docID string) error {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "delete"),
		attribute.String("db.collection", ic.collectionName),
		attribute.String("db.document", docID),
	)

	doc := ic.Doc(docID)
	_, err := doc.Delete(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	span.SetStatus(codes.Ok, "")
	return nil
}

// QueryWithTracing performs a query operation with tracing
func (ic *InstrumentedCollection) QueryWithTracing(ctx context.Context, query firestore.Query) ([]*firestore.DocumentSnapshot, error) {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.query")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "query"),
		attribute.String("db.collection", ic.collectionName),
	)

	iter := query.Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	span.SetAttributes(attribute.Int("db.result_count", len(docs)))
	span.SetStatus(codes.Ok, "")
	return docs, nil
}

// BatchWithTracing wraps a batch operation with tracing
func (c *Client) BatchWithTracing(ctx context.Context, fn func(*firestore.WriteBatch) error) error {
	tracer := observability.Tracer("firestore")
	ctx, span := tracer.Start(ctx, "firestore.batch")
	defer span.End()

	span.SetAttributes(
		attribute.String("db.system", "firestore"),
		attribute.String("db.operation", "batch"),
	)

	batch := c.client.Batch()
	err := fn(batch)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	_, err = batch.Commit(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	span.SetStatus(codes.Ok, "")
	return nil
}

