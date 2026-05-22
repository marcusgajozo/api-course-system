import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779464028190 implements MigrationInterface {
  name = 'AutoMigration1779464028190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "nome" character varying NOT NULL, CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios_turmas" ("usuario_id" uuid NOT NULL, "turma_id" uuid NOT NULL, CONSTRAINT "PK_7be1d14be0c613924bbc0800af2" PRIMARY KEY ("usuario_id", "turma_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6361b98f528fe1eef40b5df728" ON "usuarios_turmas"  ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58106da03b08c20ae71af8ae5f" ON "usuarios_turmas"  ("turma_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" ADD CONSTRAINT "FK_6361b98f528fe1eef40b5df728b" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" ADD CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" DROP CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" DROP CONSTRAINT "FK_6361b98f528fe1eef40b5df728b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58106da03b08c20ae71af8ae5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6361b98f528fe1eef40b5df728"`,
    );
    await queryRunner.query(`DROP TABLE "usuarios_turmas"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
